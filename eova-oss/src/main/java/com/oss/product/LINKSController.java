/**
 * Copyright (c) 2013-2015, Jieven. All rights reserved.
 *
 * Licensed under the GPL license: http://www.gnu.org/licenses/gpl.txt
 * To use it on other terms please contact us at 1623736450@qq.com
 */
package com.oss.product;

import com.jfinal.core.Controller;
import com.jfinal.json.FastJson;
import com.oss.model.LINKS;

/**
 * 产品管理
 * 
 * @author Jieven
 * 
 */
public class LINKSController extends Controller {

	public void update() throws Exception {
		int id = getParaToInt(0);

		LINKS link = LINKS.dao.findById(id);
		System.out.println(FastJson.getJson().toJson(link));
		setAttr("links", link);
		render("/product/update.html");
	}
}