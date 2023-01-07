# spring-integration-progress-bar
A progress bar that can be controlled from a Spring Integration (Java DSL) Flow.  
The progress is communicated via WebSocket.  
Recovers from page-refreshes on currently running flows.

![progress-bar.gif](progress-bar.gif)

To see it work:
- run `npm run build` to bundle the typescript code into `bundle.js`.
- run the Spring Boot Application in your favorite IDE
- open the browser at http://localhost:8080
- alternatively, you can enable live-reloading through webpack with `npm run dev` and then visit http://localhost:9000

Inspired by:
* https://github.com/joshlong/techtips/tree/master/examples/spring-integration-4.1-websockets-example
* https://github.com/johnpili/websocket-progress-bar
