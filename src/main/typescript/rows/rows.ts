import { Time, Duration } from './progress/lib';
import { ArrayUtils } from './util';
import { Progress } from './progress';
import { OnOffTimer } from './timer';

export class MessageHandler {
    static handleMessage({data}: { data: string }) {
        const {start: start, flowId, percentPerSecond, percent} = JSON.parse(data);
        Rows.updateProgress(new Date(parseInt(start)), flowId, percentPerSecond, percent);
    }
}

export class Rows {
    private static readonly timer = new OnOffTimer(Rows.timerBasedUpdate);
    private static rowsMap = new Map<string, Row>();

    static createRow(flowId: string, start: Date, percentPerSecond: number, percent: number = 0) {
        const row = new Row(flowId, start, percent);
        row.initializeRow(percentPerSecond);
        row.updateEntireRow(); // on page refresh
        this.rowsMap.set(flowId, row);
        Rows.timer.keepActive();
    }

    static updateProgress(start: Date, flowId: string, percentPerSecond: number, percent: number) {
        Rows.createRowIfNecessary(start, flowId, percentPerSecond, percent);
        Rows.rowsMap.get(flowId)!.updatePercent(percent);
        if (Rows.allFlowsAreFinished()) {
            Rows.timer.deactivate();
        }
    }

    static allFlowsAreFinished() {
        return Rows.rows().every(row => row.isFlowFinished());
    }

    static timerBasedUpdate() {
        Rows.rows().forEach(row => row.updateEntireRow())
        Rows.sort();
    }

    private static createRowIfNecessary(start: Date, flowId: string, percentPerSecond: number, percent: number) {
        // e.g. if we refresh the page during a running flow
        if (!Rows.rowsMap.has(flowId)) {
            this.createRow(flowId, start, percentPerSecond, percent);
        }
    }

    private static rows(): Row[] {
        return Array.from(this.rowsMap.values());
    }

    private static sort() {
        RowCreator.getRows()
            .reverse() // preserves sort order for rows with same progress/percent
            .forEach(row => RowCreator.appendInOrder(row, parseInt(row.dataset.percent!)));
    }
}

class RowCreator {
    static createRowFromTemplate(flowId: string, start: number, percent: number): HTMLElement {
        // @ts-ignore
        const row: HTMLElement = document.getElementById('progress-row').content.cloneNode(true);
        this.setFlowId(row, flowId);
        this.setStart(row, start);
        this.setPercent(row);
        this.appendInOrder(row, percent);
        // we can't return 'row' as it is empty after appending
        return this.queryBy(flowId);
    }

    public static appendInOrder(row: HTMLElement, percent: number) {
        const rows = this.getRows();
        const newIndex = this.getNewIndex(rows, percent);
        const nextSibling = this.getNextSibling(rows, newIndex);
        const rowsContainer = this.getRowsContainer();
        this.insertBeforeNextSibling(nextSibling, rowsContainer, row);
    }

    public static getRowsContainer(): HTMLElement {
        return document.getElementById('root')!;
    }

    public static getRows(): HTMLElement[] {
        return [...this.getRowsContainer().querySelectorAll('.flow-progress')] as HTMLElement[];
    }

    public static getNewIndex(children: HTMLElement[], percent: number) {
        const percentValues: number[] = children.map(s => parseInt(s.dataset.percent as string));
        return ArrayUtils.getInsertionIndex(percentValues, percent);
    }

    public static getNextSibling(children: HTMLElement[], newIndex: number): HTMLElement | null {
        return (newIndex < children.length) ? children[newIndex] : null;
    }

    public static insertBeforeNextSibling(nextSibling: HTMLElement | null, parent: HTMLElement, row: any) {
        if (nextSibling != null) {
            parent.insertBefore(row, nextSibling);
        } else {
            parent.appendChild(row);
        }
    }

    private static setFlowId(row: HTMLElement, flowId: string) {
        row.querySelector<HTMLElement>('.flow-progress')!.dataset.flowId = flowId;
    }

    private static setStart(row: HTMLElement, start: number) {
        row.querySelector<HTMLElement>('.flow-progress')!.dataset.start = String(start);
    }

    private static setPercent(row: HTMLElement) {
        row.querySelector<HTMLElement>('.flow-progress')!.dataset.percent = '0';
    }

    private static queryBy(flowId: string): HTMLElement {
        return document.querySelector(`[data-flow-id="${flowId}"]`)! as HTMLElement;
    }
}

class Row {
    private readonly row: HTMLElement;
    private progress: Progress;

    constructor(flowId: string, start: Date, percent: number) {
        this.row = RowCreator.createRowFromTemplate(flowId, start.getTime(), percent);
        this.progress = Progress.create(start, new Date(), percent);
    }

    isFlowFinished(): boolean {
        return !!this.progress && this.progress.isFinished();
    }

    initializeRow(percentPerSecond: number) {
        this.percentPerSecond(percentPerSecond);
        this.start();
        this.duration();
    }

    updatePercent(percent: number): void {
        this.progress = this.progress.updatePercent(new Date(), percent);
        this.row.dataset.percent = `${percent}`;
        this.progressBar();
        if (this.progress.isFinished()) {
            this.updateEntireRow();
        }
    }

    updateEntireRow(): void {
        if (!this.isFlowFinished()) {
            this.progress = this.progress.updateTime(new Date());
        }
        this.duration();
        this.timeSinceLastUpdate();
        if (this.progress.percent().isZero())
            return; // can happen if called by timer before the first update arrived for this row
        this.remaining();
        this.end();
    }

    private percentPerSecond(percentPerSecond: number): void {
        this.row.querySelector<HTMLElement>('.percent-per-second')!.innerText = `${percentPerSecond}%`;
    }

    private start(): void {
        this.row.querySelector<HTMLElement>('.start')!.innerText = this.progress.start().format(Time.localTimeFormatter);
    }

    private progressBar(): void {
        this.row.querySelector<HTMLElement>('.progress-bar')!.style.width = this.progress.percent().format(Formatter.percent);
        this.row.querySelector<HTMLElement>('.progress-bar')!.innerText = this.progress.percent().format(Formatter.percent);
    }

    private duration(): void {
        this.row.querySelector<HTMLElement>('.duration')!.innerText = this.progress.duration().toString();
    }

    private timeSinceLastUpdate(): void {
        const timeSinceLastUpdate = this.progress.timeSinceLastUpdate();
        this.row.querySelector<HTMLElement>('.time-since-last-update')!.innerText =
            timeSinceLastUpdate.isLessThan(Duration.ofSeconds(1)) ? '' : timeSinceLastUpdate.toString();
        this.row.querySelector<HTMLElement>('.time-since-last-update')!.style.color = this.getLateColor(timeSinceLastUpdate)
    }

    private remaining(): void {
        this.row.querySelector<HTMLElement>('.remaining')!.innerText = this.progress.isFinished() ? '' : this.progress.remaining()!.toString();
    }

    private end(): void {
        if (this.progress.isFinished()) {
            this.row.querySelector<HTMLElement>('.end')!.classList.remove('dim');
        } else {
            this.row.querySelector<HTMLElement>('.end')!.classList.add('dim');
        }
        this.row.querySelector<HTMLElement>('.end')!.innerText = this.progress.end()!.format(Time.localTimeFormatter);
    }

    private isLate(timeSinceLastUpdate: Duration): boolean {
        return timeSinceLastUpdate.isGreaterThan(Duration.ofSeconds(10));
    }

    private isVeryLate(timeSinceLastUpdate: Duration): boolean {
        return timeSinceLastUpdate.isGreaterThan(Duration.ofSeconds(60));
    }

    private getLateColor(timeSinceLastUpdate: Duration) {
        return this.isVeryLate(timeSinceLastUpdate)
            ? 'orangered'
            : this.isLate(timeSinceLastUpdate)
                ? 'orange'
                : '';
    }
}

class Formatter {
    static percent = (percent: number) => `${percent}%`;
}
