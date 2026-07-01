package com.dms.landing.controller;

import com.dms.landing.service.SiteConfigService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

/** 아임웹 등 외부 사이트에 iframe 으로 삽입하는 문의 폼 단독 페이지. */
@Controller
public class EmbedController {

    private final SiteConfigService siteConfigService;

    public EmbedController(SiteConfigService siteConfigService) {
        this.siteConfigService = siteConfigService;
    }

    @GetMapping("/embed/form")
    public String form(Model model) {
        model.addAttribute("config", siteConfigService.get());
        return "embed-form";
    }
}
