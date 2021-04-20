package com.ctrip.framework.apollo.portal.repository;

import com.ctrip.framework.apollo.common.dto.PageDTO;
import com.ctrip.framework.apollo.common.entity.App;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.PagingAndSortingRepository;

import java.util.List;
import java.util.Set;


public interface AppRepository extends PagingAndSortingRepository<App, Long> {

  App findByAppId(String appId);

  List<App> findByAppIdIn(Set<String> appIds);

  List<App> findByOrgIdAndAppIdIn(String orgId,Set<String> appIds, Pageable pageable);

  Page<App> findByOrgIdInAndAppIdContainingOrOrgIdInAndNameContaining(List<String> orgIds,String appId, List<String> orgIdss,String name, Pageable pageable);

  @Modifying
  @Query("UPDATE App SET IsDeleted=1,DataChange_LastModifiedBy = ?2 WHERE AppId=?1")
  int deleteApp(String appId, String operator);

  Page<App> findByOrgIdIn(List<String> orgIds, Pageable pageable);

}
