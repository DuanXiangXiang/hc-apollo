package com.ctrip.framework.apollo.portal.controller;

import com.ctrip.framework.apollo.common.exception.BadRequestException;
import com.ctrip.framework.apollo.core.utils.StringUtils;
import com.ctrip.framework.apollo.portal.entity.bo.UserInfo;
import com.ctrip.framework.apollo.portal.entity.po.UserPO;
import com.ctrip.framework.apollo.portal.entity.vo.UserVO;
import com.ctrip.framework.apollo.portal.spi.LogoutHandler;
import com.ctrip.framework.apollo.portal.spi.UserInfoHolder;
import com.ctrip.framework.apollo.portal.spi.UserService;
import com.ctrip.framework.apollo.portal.spi.springsecurity.SpringSecurityUserService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;

@RestController
public class UserInfoController {

  private final UserInfoHolder userInfoHolder;
  private final LogoutHandler logoutHandler;
  private final UserService userService;

  public UserInfoController(
      final UserInfoHolder userInfoHolder,
      final LogoutHandler logoutHandler,
      final UserService userService) {
    this.userInfoHolder = userInfoHolder;
    this.logoutHandler = logoutHandler;
    this.userService = userService;
  }


  @PreAuthorize(value = "@permissionValidator.isSuperAdmin()")
  @PostMapping("/users")
  public void createOrUpdateUser(@RequestBody UserVO user) {
    if (StringUtils.isContainEmpty(user.getUsername(), user.getPassword())) {
      throw new BadRequestException("Username and password can not be empty.");
    }

    if (userService instanceof SpringSecurityUserService) {
      ((SpringSecurityUserService) userService).createOrUpdate(user);
    } else {
      throw new UnsupportedOperationException("Create or update user operation is unsupported");
    }

  }

  @GetMapping("/user")
  public UserInfo getCurrentUserName() {
    return userInfoHolder.getUser();
  }

  @GetMapping("/user/logout")
  public void logout(HttpServletRequest request, HttpServletResponse response) throws IOException {
    logoutHandler.logout(request, response);
  }

  @GetMapping("/users")
  public List<UserInfo> searchUsersByKeyword(@RequestParam(value = "keyword") String keyword,
                                             @RequestParam(value = "offset", defaultValue = "0") int offset,
                                             @RequestParam(value = "limit", defaultValue = "10") int limit) {
    return userService.searchUsers(keyword, offset, limit);
  }

  @GetMapping("/users/{userId}")
  public UserInfo getUserByUserId(@PathVariable String userId) {
    return userService.findByUserId(userId);
  }


  /**
   * 接收前端传来的用户名，调用SpringSecurityUserService里面的findByUserName方法，将用户id存入UserVO对象，然后返回给前端，
   * 前端通过result.id的方式判断用户是否存在，如果这个结果为-1，则不存在，否则其值应该是这个用户的id
   * @param username
   * @return
   */
  @GetMapping("/users/find_user/by_username")
  public UserVO findUserIdByName(@RequestParam(value = "username",required = false) String username){
    if (userService instanceof SpringSecurityUserService) {
      return ((SpringSecurityUserService) userService).findByUserName(username);
    } else {
      throw new UnsupportedOperationException("Get userId by username operation is unsupported");
    }
  }

}
