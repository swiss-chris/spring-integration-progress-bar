package ch.dickinson.springintegration.progressbar;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.integration.dsl.IntegrationFlow;
import org.springframework.integration.dsl.Pollers;
import org.springframework.integration.websocket.ServerWebSocketContainer;
import org.springframework.integration.websocket.outbound.WebSocketOutboundMessageHandler;
import org.springframework.messaging.MessageHandler;
import org.springframework.messaging.support.GenericMessage;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicInteger;

import static org.springframework.integration.handler.LoggingHandler.Level.DEBUG;
import static org.springframework.integration.handler.LoggingHandler.Level.INFO;
import static org.springframework.messaging.simp.SimpMessageHeaderAccessor.SESSION_ID_HEADER;

/**
 * inspired by:
 * <a href="https://github.com/joshlong/techtips/tree/master/examples/spring-integration-4.1-websockets-example">spring-integration-4.1-websockets-example</a>
 * <a href="https://github.com/johnpili/websocket-progress-bar">websocket-progress-bar</a>
 */
@Configuration
@ComponentScan
@RestController
@EnableAutoConfiguration
public class Application {

    private static final GenericMessage<Object> EMPTY_MESSAGE = new GenericMessage<>("");
    private static final AtomicInteger COUNTER = new AtomicInteger();
    private static final int PERCENT_PER_SECOND = 5;

    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }

    @Bean
    IntegrationFlow isochroneSchedulerFlow() {
        return IntegrationFlow
                .from(() -> EMPTY_MESSAGE, e -> e.poller(Pollers.fixedRate(Duration.ofMillis(1000 / PERCENT_PER_SECOND))))
                .transform(m -> COUNTER.incrementAndGet() % 99 + 1) // from 1 to 100
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
                .handle(webSocketOutboundAdapter());
    }

    @Bean
    ServerWebSocketContainer serverWebSocketContainer() {
        return new ServerWebSocketContainer("/messages").withSockJs();
    }

    @Bean
    MessageHandler webSocketOutboundAdapter() {
        return new WebSocketOutboundMessageHandler(serverWebSocketContainer());
    }

    private static String getLogCat(Object anonymousInstance) {
        return anonymousInstance.getClass().getName() + anonymousInstance.getClass().getEnclosingMethod().getName();
    }
}
