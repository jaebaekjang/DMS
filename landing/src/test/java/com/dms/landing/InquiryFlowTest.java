package com.dms.landing;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(properties = {
        "dms.data-dir=./target/test-data",
        "spring.thymeleaf.cache=false"
})
class InquiryFlowTest {

    @Autowired
    MockMvc mvc;

    @Test
    void landingPageRenders() throws Exception {
        mvc.perform(get("/"))
                .andExpect(status().isOk())
                .andExpect(content().string(org.hamcrest.Matchers.containsString("무료 상담 신청")));
    }

    @Test
    void validInquiryIsAccepted() throws Exception {
        String body = "{\"storeName\":\"테스트식당\",\"phone\":\"010-1234-5678\",\"region\":\"서울\","
                + "\"issues\":[\"벌레/해충\"],\"industry\":\"음식점\",\"size\":\"10평 미만\",\"message\":\"문의합니다\",\"company\":\"\"}";
        mvc.perform(post("/api/inquiry").contentType("application/json").content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ok").value(true));
    }

    @Test
    void honeypotRejectsBots() throws Exception {
        String body = "{\"storeName\":\"봇\",\"phone\":\"010-0000-0000\",\"company\":\"spam-corp\"}";
        mvc.perform(post("/api/inquiry").contentType("application/json").content(body))
                .andExpect(status().isBadRequest());
    }

    @Test
    void missingPhoneIsRejected() throws Exception {
        String body = "{\"storeName\":\"전화없음\",\"company\":\"\"}";
        mvc.perform(post("/api/inquiry").contentType("application/json").content(body))
                .andExpect(status().isBadRequest());
    }

    @Test
    void adminRequiresAuth() throws Exception {
        mvc.perform(get("/admin")).andExpect(status().is3xxRedirection());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void adminDashboardLoadsWhenAuthenticated() throws Exception {
        mvc.perform(get("/admin")).andExpect(status().isOk());
    }
}
