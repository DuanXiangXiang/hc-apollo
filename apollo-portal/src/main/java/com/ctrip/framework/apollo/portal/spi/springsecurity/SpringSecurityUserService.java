package com.ctrip.framework.apollo.portal.spi.springsecurity;

import com.ctrip.framework.apollo.portal.entity.po.UserOrganization;
import com.ctrip.framework.apollo.portal.entity.vo.Organization;
import com.ctrip.framework.apollo.portal.entity.vo.UserVO;
import com.ctrip.framework.apollo.portal.repository.UserOrganizationsRepository;
import com.google.common.collect.Lists;

import com.ctrip.framework.apollo.core.utils.StringUtils;
import com.ctrip.framework.apollo.portal.entity.bo.UserInfo;
import com.ctrip.framework.apollo.portal.entity.po.UserPO;
import com.ctrip.framework.apollo.portal.repository.UserRepository;
import com.ctrip.framework.apollo.portal.spi.UserService;

import java.util.Collections;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.JdbcUserDetailsManager;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import javax.annotation.PostConstruct;

/**
 * @author lepdou 2017-03-10
 */
public class SpringSecurityUserService implements UserService {

  private PasswordEncoder encoder = new BCryptPasswordEncoder();
  private List<GrantedAuthority> authorities;

  @Autowired
  private JdbcUserDetailsManager userDetailsManager;
  @Autowired
  private UserRepository userRepository;

  //将UserOrganizationRepository的对象注入
  @Autowired
  private UserOrganizationsRepository userOrganizationsRepository;

  @PostConstruct
  public void init() {
    authorities = new ArrayList<>();
    authorities.add(new SimpleGrantedAuthority("ROLE_user"));
  }

  @Transactional
  public void createOrUpdate(UserVO user) {
    String username = user.getUsername();

    User userDetails = new User(username, encoder.encode(user.getPassword()), authorities);

    UserPO managedUser = new UserPO();

    if (userDetailsManager.userExists(username)) {
      if (!"123456".equals(user.getPassword())){
        managedUser = userRepository.findByUsername(username);
        userDetailsManager.updateUser(userDetails);
      }else {
        managedUser.setUsername(user.getUsername());
      }
      userOrganizationsRepository.deleteByUserId(managedUser.getId());
    } else {
      userDetailsManager.createUser(userDetails);
      managedUser = userRepository.findByUsername(username);
    }

    managedUser.setEmail(user.getEmail());

    userRepository.save(managedUser);

    //获取选中的部门
    List<Organization> organizations = user.getOrganizations();
    //将用户部门关系存入数据库
    for (Organization organization : organizations) {
      UserOrganization userOrganization = new UserOrganization();
      userOrganization.setUserId(managedUser.getId());
      userOrganization.setOrgId(organization.getOrgId());
      userOrganization.setOrgName(organization.getOrgName());
      userOrganizationsRepository.save(userOrganization);
    }
  }

  @Override
  public List<UserInfo> searchUsers(String keyword, int offset, int limit) {
    List<UserPO> users;
    if (StringUtils.isEmpty(keyword)) {
      users = userRepository.findFirst20ByEnabled(1);
    } else {
      users = userRepository.findByUsernameLikeAndEnabled("%" + keyword + "%", 1);
    }

    List<UserInfo> result = Lists.newArrayList();
    if (CollectionUtils.isEmpty(users)) {
      return result;
    }

    result.addAll(users.stream().map(UserPO::toUserInfo).collect(Collectors.toList()));

    return result;
  }

  @Override
  public UserInfo findByUserId(String userId) {
    UserPO userPO = userRepository.findByUsername(userId);
    return userPO == null ? null : userPO.toUserInfo();
  }

  @Override
  public List<UserInfo> findByUserIds(List<String> userIds) {
    List<UserPO> users = userRepository.findByUsernameIn(userIds);

    if (CollectionUtils.isEmpty(users)) {
      return Collections.emptyList();
    }

    List<UserInfo> result = Lists.newArrayList();

    result.addAll(users.stream().map(UserPO::toUserInfo).collect(Collectors.toList()));

    return result;
  }

  //根据用户名 查询用户信息
  public UserVO findByUserName(String username) {
    UserPO user = userRepository.findByUsername(username);
    UserVO userVO = new UserVO();
    if (user == null){
      userVO.setId(-1);
      return userVO;
    }
    userVO.setId(user.getId());
    //userVO.setPassword();
    userVO.setEmail(user.getEmail());
    return userVO;
  }

  //根据用户名查询用户所在部门列表
  public List<Organization> findUserOrganizationByUserName(String username) {
    //根据当前登录用户名查询users表，获取用户id
    long userId = userRepository.findByUsername(username).getId();
    //根据用户id查询userorganizations表，查询出用户部门信息
    List<UserOrganization> userOrgs = userOrganizationsRepository.findByUserId(userId);
    //将用户的部门信息抽取出来封装为部门对象存入集合返回
    ArrayList<Organization> organizations = new ArrayList<>();
    for (UserOrganization userOrg : userOrgs) {
      Organization organization = new Organization();
      organization.setOrgId(userOrg.getOrgId());
      organization.setOrgName(userOrg.getOrgName());
      organizations.add(organization);
    }
    return organizations;
  }
}
