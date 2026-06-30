package com.dms.landing.controller;

import com.dms.landing.config.DmsProperties;
import com.dms.landing.model.SiteConfig;
import com.dms.landing.service.InquiryService;
import com.dms.landing.service.SiteConfigService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;

/** 관리자(어드민): 문의 조회 + 디자인/팝업/연동 설정. 인증은 Spring Security 가 강제한다. */
@Controller
public class AdminController {

    private final SiteConfigService siteConfigService;
    private final InquiryService inquiryService;
    private final DmsProperties props;

    public AdminController(SiteConfigService siteConfigService,
                           InquiryService inquiryService,
                           DmsProperties props) {
        this.siteConfigService = siteConfigService;
        this.inquiryService = inquiryService;
        this.props = props;
    }

    @GetMapping("/admin/login")
    public String login() {
        return "admin/login";
    }

    @GetMapping("/admin")
    public String dashboard(Model model) {
        model.addAttribute("inquiries", inquiryService.all());
        model.addAttribute("total", inquiryService.count());
        model.addAttribute("active", "dashboard");
        return "admin/dashboard";
    }

    @GetMapping("/admin/design")
    public String designForm(Model model) {
        model.addAttribute("config", siteConfigService.get());
        model.addAttribute("active", "design");
        return "admin/design";
    }

    @PostMapping("/admin/design")
    public String saveDesign(@ModelAttribute("design") SiteConfig.Design design) {
        SiteConfig c = siteConfigService.get();
        c.setDesign(design);
        siteConfigService.save(c);
        return "redirect:/admin/design?saved";
    }

    @GetMapping("/admin/popup")
    public String popupForm(Model model) {
        model.addAttribute("config", siteConfigService.get());
        model.addAttribute("active", "popup");
        return "admin/popup";
    }

    @PostMapping("/admin/popup")
    public String savePopup(@ModelAttribute("popup") SiteConfig.Popup popup) {
        SiteConfig c = siteConfigService.get();
        c.setPopup(popup);
        siteConfigService.save(c);
        return "redirect:/admin/popup?saved";
    }

    @GetMapping("/admin/integrations")
    public String integrationsForm(Model model) {
        model.addAttribute("config", siteConfigService.get());
        model.addAttribute("active", "integrations");
        // 비밀값은 값 자체를 노출하지 않고 "설정됨/미설정" 상태만 표시한다.
        model.addAttribute("ga4SecretSet", notBlank(props.getIntegrations().getGa4().getApiSecret()));
        model.addAttribute("metaTokenSet", notBlank(props.getIntegrations().getMeta().getAccessToken()));
        model.addAttribute("messagingSet",
                notBlank(props.getIntegrations().getMessaging().getProviderUrl())
                        && notBlank(props.getIntegrations().getMessaging().getApiKey()));
        return "admin/integrations";
    }

    @PostMapping("/admin/tracking")
    public String saveTracking(@ModelAttribute("tracking") SiteConfig.Tracking tracking) {
        SiteConfig c = siteConfigService.get();
        c.setTracking(tracking);
        siteConfigService.save(c);
        return "redirect:/admin/integrations?saved";
    }

    @PostMapping("/admin/notify")
    public String saveNotify(@ModelAttribute("notify") SiteConfig.Notify notify) {
        SiteConfig c = siteConfigService.get();
        c.setNotify(notify);
        siteConfigService.save(c);
        return "redirect:/admin/integrations?saved";
    }

    private static boolean notBlank(String s) {
        return s != null && !s.isBlank();
    }
}
