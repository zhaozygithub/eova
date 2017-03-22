package com.demo;

import com.eova.aop.AopContext;
import com.eova.aop.MetaObjectIntercept;

/**
 * 
 * 演示业务拦截器
 * 
 * @author zhaozy
 * 
 */
public class LinksIntercept extends  MetaObjectIntercept {

	/** * 查询前置 DIY查询条件 */
	@Override
	public void queryBefore(AopContext ac) throws Exception {
	// 追加条件：在现有Query 基础上补充条件
	ac.condition = " and id < ?";
	ac.params.add(100);
	// 覆盖条件：完全覆盖当前Query
	// ac.where = " where id < ?";
	// ac.params.add(5);
	}
	
}
