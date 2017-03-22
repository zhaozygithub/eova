/**
 * Copyright (c) 2013-2015, Jieven. All rights reserved.
 *
 * Licensed under the GPL license: http://www.gnu.org/licenses/gpl.txt
 * To use it on other terms please contact us at 1623736450@qq.com
 */
package com.oss.product;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;
import com.jfinal.core.Controller;
import com.jfinal.json.FastJson;
import com.oss.model.Product;

/**
 * 产品管理
 * 
 * @author Jieven
 * 
 */
public class ProductController extends Controller {

	public void update() throws Exception {
		int id = getParaToInt(0);
        Product product=Product.dao.findById(id);
        System.out.println(JSON.toJSONString(product));
		setAttr("product", product);

		render("/product/update.html");
	}
}