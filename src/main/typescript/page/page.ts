import {ArrayUtils} from '../util';
import {Progress} from '../progress';
import {remainingTimerDeActivator, websocketConnector} from '../main';

interface StartFlowParams {
    flowId: string;
    start: number;
    sources: string;
    categories: string;
}

////// -------- ON FORM SUBMIT -------- //////

export class Form {
    static submit() {
        websocketConnector.reconnect();
        const {flowId, start, sources, categories}: StartFlowParams = this.getParams();
        Rows.createRow(flowId, new Date(start), sources, categories);
        this.startFlow({flowId, start, sources, categories});
        return false; // prevent regular form submit & page refresh
    }

    private static startFlow({start, flowId, sources, categories}: StartFlowParams) {
        const queryParams = new URLSearchParams({flowId, start: start.toString(), sources, categories});
        const toString = queryParams.toString();
        fetch(`http://localhost:8080/flow?${toString}`, {
            method: 'post',
            mode: 'no-cors',
        });
    }

    private static getParams() {
        // @ts-ignore
        const {sources, categories} = Object.fromEntries(new FormData(document.getElementById("startflow")));
        const timestamp = Date.now();
        return {
            start: timestamp,
            flowId: timestamp.toString(), // ideally we'd use a proper 'uuid' for 'flowId'
            sources: sources as string,
            categories: categories as string,
        };
    }
}

export class MessageHandler {
    static handleMessage({data}: { data: string }) {
        const {start: start, flowId, sources, categories, percent} = JSON.parse(data);
        Rows.updateProgress(new Date(parseInt(start)), flowId, sources, categories, percent);
    }
}

export class Rows {
    private static rowsMap = new Map<string, Row>();

    static createRow(flowId: string, start: Date, sources: string, categories: string, percent: number = 0) {
        this.rowsMap.set(flowId, new Row(RowCreator.createRowFromTemplate(flowId, start.getTime()), start, sources, categories, percent));
        if (percent > 0) {
            this.rowsMap.get(flowId)!.updateRemaining(); // on page refresh
        }
    }

    static updateProgress(start: Date, flowId: string, sources: string, categories: string, percent: number) {
        Rows.createNowIfNecessary(start, flowId, sources, categories, percent);
        Rows.rowsMap.get(flowId)!.updateProgress(start, percent);
        remainingTimerDeActivator.update();
    }

    static allFlowsAreFinished() {
        return Rows.rows().every(row => row.isFlowFinished());
    }

    static updateRemaining() {
        Rows.rows().forEach(row => row.updateRemaining())
    }

    private static createNowIfNecessary(start: Date, flowId: string, sources: string, categories: string, percent: number) {
        // e.g. if we refresh the page during a running flow
        if (!Rows.rowsMap.has(flowId)) {
            this.createRow(flowId, start, sources, categories, percent);
        }
    }

    private static rows(): Row[] {
        return Array.from(this.rowsMap.values());
    }
}

class RowCreator {
    static createRowFromTemplate(flowId: string, start: number): HTMLElement {
        // @ts-ignore
        const row: HTMLElement = document.getElementById('progress-row').content.cloneNode(true);
        this.setFlowId(row, flowId);
        this.setStart(row, start);
        this.appendInOrder(row, start);
        // we can't return 'row' as it is empty after appending
        return this.queryBy(flowId);
    }

    private static appendInOrder(row: HTMLElement, start: number) {
        const parent = this.getParent();
        const children = this.getChildren(parent)
        const newIndex = this.getNewIndex(children, start);
        const nextSibling = this.getNextSibling(children, newIndex);
        this.insertBeforeNextSibling(nextSibling, parent, row);
    }

    private static getParent(): HTMLElement {
        return document.getElementById('root')!;
    }

    private static getChildren(parent: HTMLElement): HTMLElement[] {
        return [...parent.querySelectorAll('.flow-progress')] as HTMLElement[];
    }

    private static getNewIndex(children: HTMLElement[], start: number) {
        const startValues: number[] = children.map(s => parseInt(s.dataset.start as string));
        return ArrayUtils.getInsertionIndex(startValues, start, false);
    }

    private static getNextSibling(children: HTMLElement[], newIndex: number): HTMLElement | null {
        return (newIndex < children.length) ? children[newIndex] : null;
    }

    private static insertBeforeNextSibling(nextSibling: HTMLElement | null, parent: HTMLElement, row: any) {
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

    private static queryBy(flowId: string): HTMLElement {
        return document.querySelector(`[data-flow-id="${flowId}"]`)! as HTMLElement;
    }
}

class Row {
    private readonly row: HTMLElement;
    private progress: Progress;

    constructor(row: HTMLElement, start: Date, sources: string, categories: string, percent: number) {
        this.row = row;
        this.progress = new Progress(start, new Date(), percent);
        this.initializeRow(sources, categories);
    }

    isFlowFinished(): boolean {
        return !!this.progress && this.progress.isFinished();
    }

    private initializeRow(sources: string, categories: string) {
        this.sources(sources);
        this.categories(categories);
        this.start();
    }

    updateProgress(start: Date, percent: number): void {
        this.progress = new Progress(start, new Date(), percent);
        this.progressBar();
        if (this.progress.isFinished()) {
            this.updateRemaining();
        }
    }

    updateRemaining(): void {
        if (this.progress.percent().isZero()) return; // can happen if called by timer before the first update arrived for this row
        this.duration();
        this.remaining();
        this.end();
    }

    private sources(sources: string): void {
        this.row.querySelector<HTMLElement>('.sources')!.innerText = sources;
    }

    private categories(categories: string): void {
        this.row.querySelector<HTMLElement>('.categories')!.innerText = categories;
    }

    private start(): void {
        this.row.querySelector<HTMLElement>('.start')!.innerText = this.progress.start().date().toLocaleTimeString();
    }

    private progressBar(): void {
        this.row.querySelector<HTMLElement>('.progress-bar')!.style.width = this.progress.percent().format(Formatter.percent);
        this.row.querySelector<HTMLElement>('.progress-bar')!.innerText = this.progress.percent().format(Formatter.percent);
    }

    private duration(): void {
        this.row.querySelector<HTMLElement>('.duration')!.innerText = this.progress.duration().toString();
    }

    private remaining(): void {
        this.row.querySelector<HTMLElement>('.remaining')!.innerText = this.progress.isFinished() ? '' : this.progress.remaining()!.toString();
    }

    private end(): void {
        this.row.querySelector<HTMLElement>('.end')!.innerText = this.progress.end().date().toLocaleTimeString();
        if (this.progress.isFinished()) {
            this.row.querySelector<HTMLElement>('.end')!.classList.remove('dim');
        } else {
            this.row.querySelector<HTMLElement>('.end')!.classList.add('dim');
        }
    }
}

class Formatter {
    static percent = (percent: number) => `${percent}%`;
}
