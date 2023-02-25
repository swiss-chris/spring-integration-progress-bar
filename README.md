# spring-integration-progress-bar
A progress bar that can be controlled from a Spring Integration (Java DSL) Flow.  
The progress is communicated via WebSocket.  
Recovers from page-refreshes on currently running flows and also runs in parallel in multiple tabs

![progress-bar.gif](progress-bar.gif)

# Getting started

## Using Github Codespaces
If you use Github Codespaces, you already have all the necessary dependencies from the `.devcontainer/Dockerfile`.

## Installing the dependencies on your local machine
You can check the `.devcontainer/Dockerfile` and install the required dependencies manually. Many of them are only necessary for the Selenium Test to work.

## To get up and running quickly
- run `npm run build` to bundle the typescript code into `bundle.js`.
- run the Spring Boot `Application` in your favorite IDE.
  - If you are using Codespaces, open it inside VS Code instead of in the browser to start the application. 
- open the browser at http://localhost:8080

## To develop using live-reloading through webpack
- run the Spring Boot `Application` in your favorite IDE, but set the Spring Profile to 'localhost'.
- run the `webpack-dev-server` with `npm run dev`
- open the browser at http://localhost:9000

## To run the Selenium SpringBootTest manually
- run `npm run build` to bundle the typescript code into `bundle.js`.
  - repeat this step after you change the typescript code. 
- run the `ProgressBarIT`.
- alternatively, you can run `mvn test` which does everything for you (see below).

## mvn package
Running `mvn test` will:
- install node and npm
- run `npm install`
- run `npm run build` which uses webpack to create `bundle.js` in the `resources` directory
- run `npm run test` to run the typescript unit tests
- run a Spring Boot Integration Test for the full application.

If you're running maven on your own machine, you can also run `mvn test -Dheadless=false` to open a browser for the Selenium test.

## Inspired by:
* https://github.com/joshlong/techtips/tree/master/examples/spring-integration-4.1-websockets-example
* https://github.com/johnpili/websocket-progress-bar
