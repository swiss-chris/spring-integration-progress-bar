package ch.dickinson.springintegration.progressbar;

import io.github.bonigarcia.wdm.WebDriverManager;
import org.hamcrest.text.IsEmptyString;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.Select;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;

import java.time.Duration;
import java.util.regex.Pattern;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.matchesPattern;
import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.DEFINED_PORT)
class ProgressBarIT {

    public static final String TIME_PATTERN = "\\d{2}:\\d{2}:\\d{2}"; // e.g. 23:59:59
    public static final String DURATION_PATTERN = "00:00:\\d{2}"; // e.g. 00:00:09

    private WebDriver driver;

    @Value(("${server.port}"))
    private Integer port;

    @Value("${headless}")
    private Boolean headless;

    @BeforeEach
    public void setUp() {
        WebDriverManager.chromedriver().setup();
        ChromeOptions options = new ChromeOptions();

        System.out.println("headless: " + headless);

        if (headless) {
            // run headless on CI environment
            options.addArguments(
                    "--no-sandbox",
                    "--disable-dev-shm-usage",
                    "--headless"
            );
        }
        driver = new ChromeDriver(options);
        driver.manage().window().maximize();
    }

    @Test
    public void testTest() {
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(3));

        driver.get("http://localhost:" + port);
        assertEquals("Spring Integration (Java DSL) Progress Bar, Using WebSockets", driver.getTitle());

        Select select = new Select(driver.findElement(By.className("form-select")));
        select.selectByValue("10");

        driver.findElement(By.xpath("//button[text() = 'Start Flow']")).click();

        final String start = driver.findElement(By.className("start")).getText();
        assertThat(start, matchesPattern(TIME_PATTERN));

        final String sources = driver.findElement(By.className("percent-per-second")).getText();
        assertThat(sources, is("10%"));

        final String duration = driver.findElement(By.className("duration")).getText();
        assertThat(duration, matchesPattern(DURATION_PATTERN));

        final String timeSinceLastUpdate = driver.findElement(By.className("time-since-last-update")).getText();
        assertThat(timeSinceLastUpdate, IsEmptyString.emptyOrNullString());

        wait.until(ExpectedConditions.textMatches(By.className("remaining"), Pattern.compile(DURATION_PATTERN)));

        final String end = driver.findElement(By.className("end")).getText();
        assertThat(end, matchesPattern(TIME_PATTERN));

        driver.quit();
    }
}

