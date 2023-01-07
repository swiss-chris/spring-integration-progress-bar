////// -------- ON FORM SUBMIT -------- //////

import {ArrayUtils, OnOffTimer, Percent, Progress, Time, TimerDeActivator, WebsocketConnector} from './lib';

export class Form {
    static submit() {
        websocketConnector.reconnect();
        const {startedAt, flowId, sources, categories}: {startedAt: number, flowId: string, sources: string, categories: string} = this.getParams();
        Rows.createRow(startedAt, flowId, sources, categories)
        this.startFlow({startedAt: startedAt.toString(), flowId, sources, categories});
        return false; // prevent regular form submit & page refresh
    }

    private static startFlow({startedAt, flowId, sources, categories}: {startedAt: string, flowId: string, sources: string, categories: string}) {
        const queryParams = new URLSearchParams({startedAt, flowId, sources, categories});
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
            categories: categories as string
        };
    }
}

class MessageHandler {
    static handleMessage({data} : {data: string}) {
        const {startedAt, flowId, sources, categories, percent} = JSON.parse(data);
        Rows.updateProgress(parseInt(startedAt), flowId, sources, categories, new Percent(percent));
    }
}

class Rows {
    private static rowsMap = new Map<string, Row>();

    static createRow(start: number, flowId: string, sources: string, categories: string, percent: Percent | null = null) {
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
            this.createRow(start, flowId, sources, categories, percent);
        }
    }

    private static rows() {
        return Array.from(this.rowsMap.values());
    }
}

class Row {
    private row;
    private start: Time;
    private progress: Progress | undefined;

    constructor(flowId: string, start: number, sources: string, categories: string, percent: Percent | null) {
        this.row = RowCreator.createRowFromTemplate(flowId, start);
        this.start = new Time(start);
        const now = Time.now();
        this.sourcesCell(sources);
        this.categoriesCell(categories);
        this.startCell();
        if (percent) {
            this.progress = percent && new Progress(percent, this.start.differenceTo(now), now);
            this.updateRemaining(); // on page refresh
        }
    }

    updateProgress(percent: Percent): void {
        const now = Time.now();
        this.progress = new Progress(percent, this.start.differenceTo(now), now)
        this.progressBarCell();
        if (this.isFlowFinished()) {
            this.durationCell();
            this.remainingCell();
            this.endCell();
        }
    }

    updateRemaining(): void {
        this.durationCell();
        this.remainingCell();
        this.endCell();
    }

    isFlowFinished(): boolean {
        return this.progress!.isFinished();
    }

    private sourcesCell(sources: string): void {
        this.row.querySelector<HTMLElement>('.sources')!.innerText = sources;
    }

    private categoriesCell(categories: string): void {
        this.row.querySelector<HTMLElement>('.categories')!.innerText = categories;
    }

    private startCell(): void {
        this.row.querySelector<HTMLElement>('.start')!.innerText = this.start.toString();
    }

    private progressBarCell(): void {
        this.row.querySelector<HTMLElement>('.progress-bar')!.style.width = this.progress!.percent().toString();
        this.row.querySelector<HTMLElement>('.progress-bar')!.innerText = this.progress!.percent().toString();
    }

    private endCell(): void {
        this.row.querySelector<HTMLElement>('.end')!.style.color = this.isFlowFinished() ? 'black' : 'lightgray';
        this.row.querySelector<HTMLElement>('.end')!.innerText = this.progress!.end().toString();
    }

    private durationCell(): void {
        this.row.querySelector<HTMLElement>('.duration')!.innerText = this.progress!.duration().toString() || '';
    }

    private remainingCell(): void {
        this.row.querySelector<HTMLElement>('.remaining')!.innerText = this.isFlowFinished() ? '' : this.progress!.remaining().toString();
    }
}

class RowCreator {
    static createRowFromTemplate(flowId: string, start: number) {
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

    private static queryBy(flowId: string): Element {
        return document.querySelector(`[data-flow-id="${flowId}"]`)!;
    }
}

////// -------- ON PAGE LOAD -------- //////

const websocketConnector = new WebsocketConnector(
    'http://localhost:8080/messages',
    MessageHandler.handleMessage
).connect();

const remainingTimerDeActivator = new TimerDeActivator(
    Rows.allFlowsAreFinished,
    new OnOffTimer(Rows.updateRemaining)
);
