package com.ctrip.framework.apollo.portal.controller;


import com.ctrip.framework.apollo.portal.component.config.PortalConfig;
import com.ctrip.framework.apollo.portal.entity.vo.Organization;
import com.ctrip.framework.apollo.portal.spi.UserService;
import com.ctrip.framework.apollo.portal.spi.springsecurity.SpringSecurityUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * @author Jason Song(song_s@ctrip.com)
 */
@RestController
@RequestMapping("/organizations")
public class OrganizationController {

  @Autowired
  private UserService userService;

  private final PortalConfig portalConfig;

  public OrganizationController(final PortalConfig portalConfig) {
    this.portalConfig = portalConfig;
  }


  @RequestMapping
  public List<Organization> loadOrganization() {
    return portalConfig.organizations();
  }


  /**
   *通过用户名查询users表获取用户的id，通过用户id查询userorganizations表获取用户的部门信息响应给前端
   * @param username
   * @return
   */
  @RequestMapping("/find-organizations/by-username")
  public List<Organization> findOrganizationByUserName(@RequestParam(value = "username",required = false) String username){
    if (userService instanceof SpringSecurityUserService) {
      return ((SpringSecurityUserService) userService).findUserOrganizationByUserName(username);
    } else {
      throw new UnsupportedOperationException("Create or update user operation is unsupported");
    }
  }
}
