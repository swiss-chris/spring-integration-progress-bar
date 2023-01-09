package ch.dickinson.springintegration.progressbar;

import io.github.bonigarcia.wdm.WebDriverManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.matchesPattern;
import static org.junit.jupiter.api.Assertions.assertEquals;

@ActiveProfiles("test")
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.DEFINED_PORT)
class ProgressBarIT {

    public static final String TIME_PATTERN = "\\d{2}:\\d{2}:\\d{2}"; // e.g. 23:59:59
    private WebDriver driver;

    @Value(("${server.port}"))
    private Integer port;

    @BeforeEach
    public void setUp() {
        WebDriverManager.chromedriver().setup();
        ChromeOptions options = new ChromeOptions();
//        options.addArguments(
//                "--no-sandbox",
//                "--disable-dev-shm-usage",
//                "--headless"
//        );
        driver = new ChromeDriver(options);
    }

    @Test
    public void testTest() {
        driver.get("http://localhost:" + port);
        assertEquals("Spring Integration (Java DSL) Progress Bar, Using WebSockets", driver.getTitle());

        driver.findElement(By.xpath("//button[text() = 'Start Flow']")).click();

        final String start = driver.findElement(By.className("start")).getText();
        assertThat(start, matchesPattern(TIME_PATTERN));

        final String sources = driver.findElement(By.className("sources")).getText();
        assertThat(sources, is("all"));

        final String categories = driver.findElement(By.className("categories")).getText();
        assertThat(categories, is("all"));

//        final String duration = driver.findElement(By.className("duration")).getText();
//        assertThat(duration, matchesPattern(TIME_PATTERN));

        driver.quit();
    }
}

