package ch.dickinson.springintegration.progressbar;

import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeansException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
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
public class Application implements ApplicationContextAware {

    private static final String HTTP_PATH = "/flow";

    private static final int ONE_SECOND = 1000; // millis

    private static final List<Integer> PERCENTAGES = IntStream.range(1, 101).boxed().toList();
    private static final String HTTP_PARAM_STARTED_AT = "start";
    private static final String HTTP_PARAM_FLOW_ID = "flowId";
    private static final String HTTP_PARAM_PERCENT_PER_SECOND = "percentPerSecond"; // 0.1, 1, 10, 100

    private static ApplicationContext applicationContext;

    @Value("${websocket.additional-allowed-origins}")
    private String[] additionalAllowedOrigins;

    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
        logServerInfos();
    }

    private static void logServerInfos() {
        final Environment environment = applicationContext.getEnvironment();
        if (List.of(environment.getActiveProfiles()).contains("localhost")) {
            log.info("Run: `npm run dev` to start the webserver on a separate port.");
        } else {
            log.info("Open: http://localhost:{}", environment.getProperty("server.port", Integer.class));
        }
    }

    @Bean
    IntegrationFlow flow() {
        return IntegrationFlow
                .from(Http.inboundChannelAdapter(HTTP_PATH)
                        .requestMapping(mapping -> mapping.methods(HttpMethod.POST))
                        .headerExpression(HTTP_PARAM_STARTED_AT, "#requestParams['%s'][0]".formatted(HTTP_PARAM_STARTED_AT))
                        .headerExpression(HTTP_PARAM_FLOW_ID, "#requestParams['%s'][0]".formatted(HTTP_PARAM_FLOW_ID))
                        .headerExpression(HTTP_PARAM_PERCENT_PER_SECOND, "T(java.lang.Float).valueOf(#requestParams['%s'][0])".formatted(HTTP_PARAM_PERCENT_PER_SECOND))
                        .get())
                .transform(Message.class, m -> MessageBuilder
                        .withPayload(PERCENTAGES)
                        // keep only these http headers to prevent any interference with the WebSocketOutboundMessageHandler
                        .setHeader(HTTP_PARAM_STARTED_AT, m.getHeaders().get(HTTP_PARAM_STARTED_AT))
                        .setHeader(HTTP_PARAM_FLOW_ID, m.getHeaders().get(HTTP_PARAM_FLOW_ID))
                        .setHeader(HTTP_PARAM_PERCENT_PER_SECOND, m.getHeaders().get(HTTP_PARAM_PERCENT_PER_SECOND))
                        .build())
                .split()
                .transform(Message.class, Application::doSomeImportantWork) // pace the messages at 'PERCENT_PER_SECOND'
                .channel(webSocketFlow().getInputChannel())
                .get();
    }

    @SneakyThrows
    private static <T> Message<T> doSomeImportantWork(Message<T> m) {
        final Float percentPerSecond = requireNonNull(m.getHeaders().get(HTTP_PARAM_PERCENT_PER_SECOND, Float.class));
        Thread.sleep((int) (ONE_SECOND / percentPerSecond));
        return m;
    }

    @Bean
    IntegrationFlow webSocketFlow() {
        final String logCat = getLogCat(new Object() {
        });
        return flow -> flow
                .<Integer>log(DEBUG, logCat, m -> "Received (%.1f perc/s): %d".formatted(m.getHeaders().get(HTTP_PARAM_PERCENT_PER_SECOND, Float.class), m.getPayload()))
                .split(Message.class, m -> serverWebSocketContainer()
                        .getSessions()
                        .keySet()
                        .stream()
                        .map(s -> MessageBuilder
                                .withPayload(Map.of(
                                        HTTP_PARAM_STARTED_AT, requireNonNull(m.getHeaders().get(HTTP_PARAM_STARTED_AT)),
                                        HTTP_PARAM_FLOW_ID, requireNonNull(m.getHeaders().get(HTTP_PARAM_FLOW_ID)),
                                        HTTP_PARAM_PERCENT_PER_SECOND, requireNonNull(m.getHeaders().get(HTTP_PARAM_PERCENT_PER_SECOND)),
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
        return new ServerWebSocketContainer("/messages")
                .setAllowedOrigins(additionalAllowedOrigins)
                .withSockJs();
    }

    private static String getLogCat(Object anonymousInstance) {
        return anonymousInstance.getClass().getName() + anonymousInstance.getClass().getEnclosingMethod().getName();
    }

    @Override
    public void setApplicationContext(@SuppressWarnings("NullableProblems") ApplicationContext applicationContext) throws BeansException {
        Application.applicationContext = applicationContext;
    }
}
