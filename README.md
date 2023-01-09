# spring-integration-progress-bar
A progress bar that can be controlled from a Spring Integration (Java DSL) Flow.  
The progress is communicated via WebSocket.  
Recovers from page-refreshes on currently running flows.

![progress-bar.gif](progress-bar.gif)

To run everything within Spring Boot:
- run `npm run build` to bundle the typescript code into `bundle.js`.
- run the Spring Boot `Application` in your favorite IDE
- open the browser at http://localhost:8080

To use live-reloading through webpack:
- run the Spring Boot Application in your favorite IDE
- run the `webpack-dev-server` with `npm run dev`
- open the browser at http://localhost:9000

You can also open the web app in two different tabs at the same time. The same progress will be displayed in both.

Running `mvn clean package` will run the typescript unit tests, bundle the typescript code into `bundle.js`, and run a Spring Boot Integration Test for the full application.

Inspired by:
* https://github.com/joshlong/techtips/tree/master/examples/spring-integration-4.1-websockets-example
* https://github.com/johnpili/websocket-progress-bar
