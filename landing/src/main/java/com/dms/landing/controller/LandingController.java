package com.dms.landing.controller;

import com.dms.landing.service.SiteConfigService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

/** 공개 랜딩페이지. */
@Controller
public class LandingController {

    private final SiteConfigService siteConfigService;

    public LandingController(SiteConfigService siteConfigService) {
        this.siteConfigService = siteConfigService;
    }

    @GetMapping("/")
    public String landing(Model model) {
        model.addAttribute("config", siteConfigService.get());
        return "landing";
    }
}
