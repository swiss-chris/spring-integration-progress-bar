# spring-integration-progress-bar
A progress bar that can be controlled from a Spring Integration (Java DSL) Flow.  
The progress is communicated via WebSocket.  
Recovers from page-refreshes on currently running flows and also runs in parallel in multiple tabs

![progress-bar.gif](progress-bar.gif)

# Getting started

## Using Github Codespaces
If you use Github Codespaces, you should already have all the necessary dependencies from the `.devcontainer/Dockerfile`.

Note: you'll need to add `-Dheadless=true` anytime you are running the tests with maven.

## Installing the dependencies on your local machine
You can check the `.devcontainer/Dockerfile` and install the required dependencies manually.

## Installing node and npm
You have 2 options:
- Install Node on your machine or developer environment.
- Run `mvn package -Dheadless=true` and it will install a copy of node into the root directory of this project

## To get up and running quickly
- run `npm run build` to bundle the typescript code into `bundle.js`.
- run the Spring Boot `Application` in your favorite IDE.
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

You can also run `mvn test -Dheadless=true` to prevent opening a browser for the Selenium test.

## Inspired by:
* https://github.com/joshlong/techtips/tree/master/examples/spring-integration-4.1-websockets-example
* https://github.com/johnpili/websocket-progress-bar
