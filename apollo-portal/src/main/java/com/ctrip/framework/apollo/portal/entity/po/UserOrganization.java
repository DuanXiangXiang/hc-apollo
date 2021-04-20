package com.ctrip.framework.apollo.portal.entity.po;

import javax.persistence.*;

@Entity
@Table(name = "UserOrganizations")
public class UserOrganization {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Id")
    private long id;

    @Column(name = "UserId",nullable = false)
    private long userId;

    @Column(name = "OrgId",nullable = false)
    private String orgId;

    @Column(name = "OrgName",nullable = false)
    private String orgName;

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public long getUserId() {
        return userId;
    }

    public void setUserId(long userId) {
        this.userId = userId;
    }

    public String getOrgId() {
        return orgId;
    }

    public void setOrgId(String orgId) {
        this.orgId = orgId;
    }

    public String getOrgName() {
        return orgName;
    }

    public void setOrgName(String orgName) {
        this.orgName = orgName;
    }
}
