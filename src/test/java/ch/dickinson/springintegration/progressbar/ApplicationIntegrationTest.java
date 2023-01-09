package ch.dickinson.springintegration.progressbar;

import io.github.bonigarcia.wdm.WebDriverManager;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;


@ActiveProfiles("test")
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.DEFINED_PORT)
class ApplicationIntegrationTest {

    private WebDriver driver;

    @Value(("${server.port}"))
    private Integer port;

    @BeforeEach
    public void setUp() {
        WebDriverManager.chromedriver().setup();
        driver = new ChromeDriver();
    }

    @Test
    public void testTest() {
        driver.get("http://localhost:" + port);
        Assertions.assertEquals("Spring Integration (Java DSL) Progress Bar, Using WebSockets", driver.getTitle());
        driver.quit();
    }

}

