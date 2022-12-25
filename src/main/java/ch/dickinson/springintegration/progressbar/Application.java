package ch.dickinson.springintegration.progressbar;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.integration.dsl.IntegrationFlow;
import org.springframework.integration.http.dsl.Http;
import org.springframework.integration.websocket.ServerWebSocketContainer;
import org.springframework.integration.websocket.outbound.WebSocketOutboundMessageHandler;
import org.springframework.messaging.support.GenericMessage;
import org.springframework.messaging.support.MessageBuilder;

import java.util.concurrent.Executors;

import static org.springframework.integration.handler.LoggingHandler.Level.DEBUG;
import static org.springframework.integration.handler.LoggingHandler.Level.INFO;
import static org.springframework.messaging.simp.SimpMessageHeaderAccessor.SESSION_ID_HEADER;

/**
 * inspired by:
 * <a href="https://github.com/joshlong/techtips/tree/master/examples/spring-integration-4.1-websockets-example">spring-integration-4.1-websockets-example</a>
 * <a href="https://github.com/johnpili/websocket-progress-bar">websocket-progress-bar</a>
 */
@Configuration
@SpringBootApplication
public class Application {

    private static final GenericMessage<Object> EMPTY_MESSAGE = new GenericMessage<>("");
    private static final String HTTP_PATH = "/flow";

    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }

    @Bean
    IntegrationFlow flow() {
        return IntegrationFlow
                .from(Http.inboundChannelAdapter(HTTP_PATH)
                        .requestMapping(mapping -> mapping.methods(HttpMethod.POST))
                        .get())
                .transform(m -> EMPTY_MESSAGE) // remove all http headers as they interfere with the WebSocketOutboundMessageHandler
                .transform(m -> 50)
                .split()
                .channel(webSocketFlow().getInputChannel())
                .get();
    }

    @Bean
    IntegrationFlow webSocketFlow() {
        final String logCat = getLogCat(new Object() {});
        return flow -> flow
                .log(INFO, logCat, m -> "Received: " + m.getPayload())
                .split(Object.class, m -> serverWebSocketContainer()
                        .getSessions()
                        .keySet()
                        .stream()
                        .map(s -> MessageBuilder.withPayload(m)
                                .setHeader(SESSION_ID_HEADER, s)
                                .build()))
                .log(DEBUG, logCat, m -> "Sent (sessID " + m.getHeaders().get(SESSION_ID_HEADER) + "): " + m.getPayload())
                .channel(c -> c.executor(Executors.newCachedThreadPool()))
                .handle(new WebSocketOutboundMessageHandler(serverWebSocketContainer()));
    }

    @Bean
    ServerWebSocketContainer serverWebSocketContainer() {
        return new ServerWebSocketContainer("/messages").withSockJs();
    }

    private static String getLogCat(Object anonymousInstance) {
        return anonymousInstance.getClass().getName() + anonymousInstance.getClass().getEnclosingMethod().getName();
    }
}
