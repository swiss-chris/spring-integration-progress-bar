package ch.dickinson.springintegration.progressbar;

import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.integration.dsl.IntegrationFlow;
import org.springframework.integration.http.dsl.Http;
import org.springframework.integration.websocket.ServerWebSocketContainer;
import org.springframework.integration.websocket.outbound.WebSocketOutboundMessageHandler;
import org.springframework.messaging.Message;
import org.springframework.messaging.support.MessageBuilder;

import java.util.List;
import java.util.Map;
import java.util.concurrent.Executors;
import java.util.stream.IntStream;

import static java.util.Objects.requireNonNull;
import static org.springframework.integration.handler.LoggingHandler.Level.DEBUG;
import static org.springframework.integration.handler.LoggingHandler.Level.TRACE;
import static org.springframework.messaging.simp.SimpMessageHeaderAccessor.SESSION_ID_HEADER;

@Slf4j
@Configuration
@SpringBootApplication
public class Application {

    private static final String HTTP_PATH = "/flow";

    private static final int PERCENT_PER_SECOND = 5;

    private static final List<Integer> PERCENTAGES = IntStream.range(1, 101).boxed().toList();
    private static final String HTTP_PARAM_SOURCES = "sources";
    private static final String HTTP_PARAM_CATEGORIES = "categories";
    private static final String HTTP_PARAM_FLOW_ID = "flowId";

    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
        log.info("Open: http://localhost:8080");
    }

    @Bean
    IntegrationFlow flow() {
        return IntegrationFlow
                .from(Http.inboundChannelAdapter(HTTP_PATH)
                        .requestMapping(mapping -> mapping.methods(HttpMethod.POST))
                        .headerExpression(HTTP_PARAM_SOURCES, "#requestParams['%s']".formatted(HTTP_PARAM_SOURCES))
                        .headerExpression(HTTP_PARAM_CATEGORIES, "#requestParams['%s']".formatted(HTTP_PARAM_CATEGORIES))
                        .headerExpression(HTTP_PARAM_FLOW_ID, "#requestParams['%s']".formatted(HTTP_PARAM_FLOW_ID))
                        .get())
                .transform(Message.class, m -> MessageBuilder
                        .withPayload(PERCENTAGES)
                        // keep only these http headers to prevent any interference with the WebSocketOutboundMessageHandler
                        .setHeader(HTTP_PARAM_SOURCES, m.getHeaders().get(HTTP_PARAM_SOURCES))
                        .setHeader(HTTP_PARAM_CATEGORIES, m.getHeaders().get(HTTP_PARAM_CATEGORIES))
                        .setHeader(HTTP_PARAM_FLOW_ID, m.getHeaders().get(HTTP_PARAM_FLOW_ID))
                        .build())
                .split()
                .transform(Application::doSomeImportantWork) // pace the messages at 'PERCENT_PER_SECOND'
                .channel(webSocketFlow().getInputChannel())
                .get();
    }

    @SneakyThrows
    private static <T> T doSomeImportantWork(T m) {
        Thread.sleep(1000 / PERCENT_PER_SECOND);
        return m;
    }

    @Bean
    IntegrationFlow webSocketFlow() {
        final String logCat = getLogCat(new Object() {});
        return flow -> flow
                .log(DEBUG, logCat, m -> "Received: " + m.getPayload())
                .split(Message.class, m -> serverWebSocketContainer()
                        .getSessions()
                        .keySet()
                        .stream()
                        .map(s -> MessageBuilder
                                .withPayload(Map.of(
                                        HTTP_PARAM_SOURCES, requireNonNull(m.getHeaders().get(HTTP_PARAM_SOURCES)),
                                        HTTP_PARAM_CATEGORIES, requireNonNull(m.getHeaders().get(HTTP_PARAM_CATEGORIES)),
                                        HTTP_PARAM_FLOW_ID, requireNonNull(m.getHeaders().get(HTTP_PARAM_FLOW_ID)),
                                        "percent", m.getPayload()
                                ))
                                .setHeader(SESSION_ID_HEADER, s)
                                .build()))
                .log(TRACE, logCat, m -> "Sent (sessID " + m.getHeaders().get(SESSION_ID_HEADER) + "): " + m.getPayload())
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
