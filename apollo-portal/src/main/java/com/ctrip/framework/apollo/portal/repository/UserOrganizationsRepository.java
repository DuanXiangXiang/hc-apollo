package com.ctrip.framework.apollo.portal.repository;

import com.ctrip.framework.apollo.portal.entity.po.UserOrganization;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.PagingAndSortingRepository;

import java.util.List;

public interface UserOrganizationsRepository extends PagingAndSortingRepository<UserOrganization,Long> {
    List<UserOrganization> findByUserId(long userId);
    //jpa就能够通过pageable参数来得到一个带分页信息的Sql语句
    List<UserOrganization> findByUserId(long userId, Pageable pageable);

    void deleteByUserId(long userId);
}
