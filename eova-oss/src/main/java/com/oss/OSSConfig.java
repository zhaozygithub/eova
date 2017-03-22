/**
 * Copyright (c) 2013-2016, Jieven. All rights reserved.
 *
 * Licensed under the GPL license: http://www.gnu.org/licenses/gpl.txt
 * To use it on other terms please contact us at 1623736450@qq.com
 */
package com.oss;

import java.util.HashSet;

import com.alibaba.druid.filter.stat.StatFilter;
import com.alibaba.druid.util.JdbcUtils;
import com.alibaba.druid.wall.WallFilter;
import com.eova.config.EovaConfig;
import com.eova.interceptor.LoginInterceptor;
import com.eova.user.UserController;
import com.jfinal.config.Plugins;
import com.jfinal.config.Routes;
import com.jfinal.plugin.activerecord.ActiveRecordPlugin;
import com.jfinal.plugin.activerecord.CaseInsensitiveContainerFactory;
import com.jfinal.plugin.activerecord.dialect.MysqlDialect;
import com.jfinal.plugin.druid.DruidPlugin;
import com.mysql.jdbc.Connection;
import com.oss.model.Address;
import com.oss.model.LINKS;
import com.oss.model.Orders;
import com.oss.model.Product;
import com.oss.model.UserInfo;
import com.oss.model.Users;
import com.oss.product.LINKSController;
import com.oss.product.ProductController;

public class OSSConfig extends EovaConfig {
	/**
	 * 自定义路由
	 *
	 * @param me
	 */
	@Override
	protected void route(Routes me) {
		// 自定义的路由配置往这里加。。。
		me.add("/user", UserController.class);

		me.add("/", OSSController.class);
		me.add("/product", ProductController.class);
		me.add("/zhao", LINKSController.class);
		
		// 不需要登录拦截的URL
		LoginInterceptor.excludes.add("/init");
		LoginInterceptor.excludes.add("/code");
	}

	/**
	 * 自定义Main数据源Model映射
	 *
	 * @param arp
	 */
	@Override
	protected void mapping(ActiveRecordPlugin arp) {
		super.mapping(arp);
		// 自定义业务Model映射往这里加
		
	}

	/**
	 * 自定义插件
	 */
	@Override
	protected void plugin(Plugins plugins) {
		
		String[] dataSources={"dlcat_content","dlcat_finance","dlcat_member","dlcat_trust"};
		
		for (String datasource : dataSources) {
			/** 新增自定义数据源start **/
			ActiveRecordPlugin arp = addDataSource(plugins,datasource, JdbcUtils.MYSQL);
//		 arp.addMapping("xxx", Xxx.class);
			/** 新增自定义数据源end **/
			
		}
		
		//兼容demo库里面的表
		ActiveRecordPlugin arp = addDataSource(plugins,"demo", JdbcUtils.MYSQL);
		arp.addMapping("user_info", UserInfo.class);
		arp.addMapping("users", Users.class);
		arp.addMapping("address", Address.class);
		arp.addMapping("orders", Orders.class);
		arp.addMapping("links", LINKS.class);
		arp.addMapping("product", Product.class);
		
		
		
		
		// 添加自动扫描插件
		// ...
	}

	/**
	 * 新增自定义数据源
	 *
	 * @param plugins
	 * @param datasource
	 * @param dbType
	 * @return
	 */
	@SuppressWarnings("unused")
	private ActiveRecordPlugin addDataSource(Plugins plugins, String datasource, String dbType) {

		// 添加数据源
		String url, user, pwd;
		url = props.get(datasource + "_url");
		user = props.get(datasource + "_user");
		pwd = props.get(datasource + "_pwd");

		WallFilter wall = new WallFilter();
		wall.setDbType(dbType);

		DruidPlugin dp = new DruidPlugin(url, user, pwd);
		dp.addFilter(new StatFilter());
		dp.addFilter(wall);

		ActiveRecordPlugin arp = new ActiveRecordPlugin(datasource, dp);
		// 方言
		arp.setDialect(new MysqlDialect());
		// 事务级别
		arp.setTransactionLevel(Connection.TRANSACTION_REPEATABLE_READ);
		// 统一全部默认小写
		arp.setContainerFactory(new CaseInsensitiveContainerFactory(true));
		// 是否显示SQL
		arp.setShowSql(true);
		System.out.println("load data source:" + url + "/" + user);

		plugins.add(dp).add(arp);

		// 注册数据源
		dataSources.add(datasource);

		return arp;
	}

	/**
	 * 自定义表达式(主要用于级联)
	 */
	@Override
	protected void exp() {
		super.exp();
		// 区域级联查询
		exps.put("selectAreaByLv2AndPid", "select id ID,name CN from area where lv = 2 and pid = ?");
		exps.put("selectAreaByLv3AndPid", "select id ID,name CN from area where lv = 3 and pid = ?");
		// 用法，级联动态在页面改变SQL和参数
		// $xxx.eovacombo({exp : 'selectAreaByLv2AndPid,aaa,10'}).reload();
		// $xxx.eovafind({exp : 'selectAreaByLv2AndPid,aaa,10'});
	}

	@Override
	protected void auth() {
		super.auth();
		HashSet<String> uris = new HashSet<String>();
		uris.add("/xxx/**");
		// auths.put(角色ID, uris);
	}

}