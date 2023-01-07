////// -------- ON FORM SUBMIT -------- //////

import {ArrayUtils, OnOffTimer, Percent, Progress, Time, TimerDeActivator, WebsocketConnector} from './lib';

interface StartFlowParams {
    flowId: string;
    startedAt: number;
    sources: string;
    categories: string;
}

export class Form {
    static submit() {
        websocketConnector.reconnect();
        const {flowId, startedAt, sources, categories}: StartFlowParams = this.getParams();
        Rows.createRow(flowId, startedAt, sources, categories)
        this.startFlow({flowId, startedAt, sources, categories});
        return false; // prevent regular form submit & page refresh
    }

    private static startFlow({startedAt, flowId, sources, categories}: StartFlowParams) {
        const queryParams = new URLSearchParams({flowId, startedAt: startedAt.toString(), sources, categories});
        const toString = queryParams.toString();
        fetch(`http://localhost:8080/flow?${toString}`, {
            method: 'post',
            mode: 'no-cors',
        });
    }

    private static getParams() {
        // @ts-ignore
        const {sources, categories} = Object.fromEntries(new FormData(document.getElementById("startflow")));
        const timestamp = +Date.now();
        return {
            startedAt: +timestamp,
            flowId: timestamp.toString(), // ideally we'd use a proper 'uuid' for 'flowId'
            sources: sources as string,
            categories: categories as string,
        };
    }
}

class MessageHandler {
    static handleMessage({data}: { data: string }) {
        const {startedAt, flowId, sources, categories, percent} = JSON.parse(data);
        Rows.updateProgress(parseInt(startedAt), flowId, sources, categories, new Percent(percent));
    }
}

class Rows {
    private static rowsMap = new Map<string, Row>();

    static createRow(flowId: string, start: number, sources: string, categories: string, percent: Percent | null = null) {
        this.rowsMap.set(flowId, new Row(flowId, start, sources, categories, percent));
    }

    static updateProgress(start: number, flowId: string, sources: string, categories: string, percent: Percent) {
        Rows.createNowIfNecessary(start, flowId, sources, categories, percent);
        Rows.rowsMap.get(flowId)!.updateProgress(percent);
        remainingTimerDeActivator.update();
    }

    static allFlowsAreFinished() {
        return Rows.rows().every(row => row.isFlowFinished());
    }

    static updateRemaining() {
        Rows.rows().forEach(row => row.updateRemaining())
    }

    private static createNowIfNecessary(start: number, flowId: string, sources: string, categories: string, percent: Percent) {
        // e.g. if we refresh the page during a running flow
        if (!Rows.rowsMap.has(flowId)) {
            this.createRow(flowId, start, sources, categories, percent);
        }
    }

    private static rows(): Row[] {
        return Array.from(this.rowsMap.values());
    }
}

class Row {
    private readonly row: HTMLElement;
    private readonly start: Time;
    private progress: Progress | undefined;

    constructor(flowId: string, start: number, sources: string, categories: string, percent: Percent | null) {
        this.row = RowCreator.createRowFromTemplate(flowId, start);
        this.start = new Time(start);
        RowUpdater.initializeRow(this.row, sources, categories, this.start);
        if (percent) {
            RowUpdater.updateRemaining(this.row, new Progress(percent, this.start, Time.now())); // on page refresh
        }
    }

    updateProgress(percent: Percent): void {
        this.progress = new Progress(percent, this.start, Time.now())
        RowUpdater.updateProgress(this.row, this.progress);
    }

    updateRemaining(): void {
        RowUpdater.updateRemaining(this.row, this.progress)
    }

    isFlowFinished(): boolean {
        return !!this.progress && this.progress.isFinished();
    }
}

class RowUpdater {
    static initializeRow(row: HTMLElement, sources: string, categories: string, start: Time) {
        this.sources(row, sources);
        this.categories(row, categories);
        this.start(row, start);
    }

    static updateProgress(row: HTMLElement, progress: Progress): void {
        this.progressBar(row, progress);
        if (progress.isFinished()) {
            this.duration(row, progress);
            this.remaining(row, progress);
            this.end(row, progress);
        }
    }

    static updateRemaining(row: HTMLElement, progress: Progress | undefined): void {
        if (!progress) return; // can happen if called by timer before the first update arrived for this row
        this.duration(row, progress);
        this.remaining(row, progress);
        this.end(row, progress);
    }

    private static sources(row: HTMLElement, sources: string): void {
        row.querySelector<HTMLElement>('.sources')!.innerText = sources;
    }

    private static categories(row: HTMLElement, categories: string): void {
        row.querySelector<HTMLElement>('.categories')!.innerText = categories;
    }

    private static start(row: HTMLElement, start: Time): void {
        row.querySelector<HTMLElement>('.start')!.innerText = start.toString();
    }

    private static progressBar(row: HTMLElement, progress: Progress): void {
        row.querySelector<HTMLElement>('.progress-bar')!.style.width = progress.percent().toString();
        row.querySelector<HTMLElement>('.progress-bar')!.innerText = progress.percent().toString();
    }

    private static end(row: HTMLElement, progress: Progress): void {
        row.querySelector<HTMLElement>('.end')!.style.color = progress.isFinished() ? 'black' : 'lightgray';
        row.querySelector<HTMLElement>('.end')!.innerText = progress.end().toString();
    }

    private static duration(row: HTMLElement, progress: Progress): void {
        row.querySelector<HTMLElement>('.duration')!.innerText = progress.duration().toString() || '';
    }

    private static remaining(row: HTMLElement, progress: Progress): void {
        row.querySelector<HTMLElement>('.remaining')!.innerText = progress.isFinished() ? '' : progress.remaining().toString();
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

////// -------- ON PAGE LOAD -------- //////

const websocketConnector = new WebsocketConnector(
    'http://localhost:8080/messages',
    MessageHandler.handleMessage,
).connect();

const remainingTimerDeActivator = new TimerDeActivator(
    Rows.allFlowsAreFinished,
    new OnOffTimer(Rows.updateRemaining),
);
