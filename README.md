# spring-integration-progress-bar
A progress bar that can be controlled from a Spring Integration (Java DSL) Flow.  
The progress is communicated via WebSocket.  
Recovers from page-refreshes on currently running flows.

![progress-bar.gif](progress-bar.gif)

To see it work:
- run the Spring Boot Application in your favorite IDE
- run `npm run dev` in a terminal or in your favorite IDE
- open the browser at http://localhost:9000

Inspired by:
* https://github.com/joshlong/techtips/tree/master/examples/spring-integration-4.1-websockets-example
* https://github.com/johnpili/websocket-progress-bar
