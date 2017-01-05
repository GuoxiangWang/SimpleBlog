var crypto=require('crypto'),
	User=require('../model/user.js'),
	Post=require('../model/post.js')[0];
	Comment=require('../model/post.js')[1];
module.exports=function(app){
	
	app.get('/',function(req,res){
		Post.get(null,function(err,posts){
			if(err){
			posts=[];
			}
			res.render('index',{
			title:"主页",
			user:req.session.user,
			posts:posts,
			success:req.flash('success').toString(),
			error:req.flash('error').toString()
			});
		});
	});
	
	
	app.get('/reg',checkNotLogin);
	app.get("/reg",function(req,res){
		res.render("reg",{
			title:"注册",
			user:req.session.user,
			success:req.flash('success').toString(),
			error:req.flash('error').toString()
			});
	});
	app.post('/reg',checkNotLogin);
	app.post("/reg",function(req,res){
		var name=req.body.name,
		password=req.body.password,
		password_re=req.body['password-repeat'];
		//检验两次输入密码一致性
		if(password_re!=password)
		{
			req.flash("error","两次输入的密码不一致！");
			return res.redirect('/reg'); //返回注册页
		}
		//生成密码的 md5 值
		var md5=crypto.createHash('md5'),
			password=md5.update(req.body.password).digest('hex');
		var newUser=new User({
			name:name,
			password:password,
			email:req.body.email
		});
		//检查用户名是否已存在
		User.get(newUser.name,function(err,user){
			if(err){
				req.flash('error',err);
				return res.redirect('/');
			}
			if(user){
				req.flash('error','用户已存在');
				return res.redirect('/reg');
			}
			//如果用户不存在则新增用户
			newUser.save(function(err,user){
				if(err){
					req.flash('error',err);
					return res.redirect('./reg');  //注册失败则返回注册页
				}
				req.session.user=newUser;
				req.flash('success','注册成功！');
				res.redirect('/');
			});
		});
	});
	app.get('/login',checkNotLogin);
	app.get("/login",function(req,res){
		res.render("login",{
			title:"登陆",
			user:req.session.user,
			success:req.flash('success').toString(),
			error:req.flash('error').toString()
			});
	})
	app.post('/login',checkNotLogin);
	app.post("/login",function(req,res){
		var md5=crypto.createHash('md5'),
		password=md5.update(req.body.password).digest('hex');
		//检查用户是否存在
		User.get(req.body.name,function(err,user){
			if(!user){
				req.flash('error','用户不存在!');
				return res.redirect('/login'); //用户不存在则跳转到登录页
			}
			//检查密码一致性
			if(user.password!=password){
				req.flash('error','密码错误！');
				return res.redirect("/login"); //密码错误则跳转到登录页
			}
			//用户名密码都匹配后，将信息存入session
			req.session.user=user;
			req.flash('success','登陆成功！');
			res.redirect('/');//登陆成功后跳转到主页
		});
	});
	app.get('/post',checkLogin);
	app.get('/post',function(req,res){
		var findResult=[{"title":"","post":""}];
		if(req.query.handle=="edit"){
			Post.find({index:eval(req.query.index)},function(err,findResult){
				Post.delItem({index:eval(req.query.index)},function(err){
					if(err)
				{
					req.flash("error",err);
				}
				else
				{
					req.flash("success","删除成功")
				}
				res.render("post",{
					result:findResult[0],
					title:"发表",
					user:req.session.user,
					success:req.flash('success').toString(),
					error:req.flash('error').toString()
					});
				})
			})
		}
		else{
			
			res.render("post",{
				result:"",
				title:"发表",
				user:req.session.user,
				success:req.flash('success').toString(),
				error:req.flash('error').toString()
				});
			}
	});
	app.post("/post",checkLogin);
	app.post("/post",function(req,res){
		var currentUser=req.session.user,
		post=new Post(currentUser.name,req.body.title,req.body.post);
		post.save(function(err){
			if(err){
				req.flash('error',err);
				return res.redirect('/');
			}
			req.flash('success','发布成功！');
			res.redirect('/'); //发表成功跳转到主页
		});
	});
	app.get('/logout',checkLogin);
	app.get("/logout",function(req,res){
		req.session.user=null;
		req.flash('success','登出成功！');
		res.redirect('/');
	});
	
	app.get('/fullPost',function(req,res){
		if(req.query.index=="random"){
			Post.get(null,function(err,posts){
				if(err){
					posts=[];
				}
				randIndex=Math.floor(posts.length*Math.random());
				randIndex=(randIndex==posts.length?randIndex:randIndex+1);
				res.redirect("/fullPost?index="+randIndex);
			})
		}
		else{
			
		
		var index=Number(req.query.index)-1;
		Post.find({"index":index},function(err,findResult){
			if(err){
				findResult={};
			}
			res.render("fullPost",{				
				user:req.session.user,
				success:req.flash('success').toString(),
				error:req.flash('error').toString(),
				title:findResult[0]["title"],
				name:findResult[0]["name"],
				time:findResult[0]["time"]['minute'],
				post:findResult[0]["post"],
				comments:findResult[0]['comments']
			})
		});
		}
	});
	
	app.post('/fullPost',function(req,res){
		var $currentUser=req.session.user;
		var index=Number(req.query.index)-1;
		var comment=new Comment($currentUser.name,req.body.comment);
		comment.save({"index":index},function(err){
			if(err){
				req.flash('error',err);
				return res.redirect('/fullPost?index='+(index+1));
			}
			req.flash('success','评论发布成功！');
			res.redirect('/fullPost?index='+(index+1));
		});


	})
	app.get("/blogList",function(req,res){
		var $user={};
		if(req.query.user){
			$user.name=req.query.user;
		}
		else{
			$user=req.session.user;
		}
		Post.find({name:$user.name},function(err,findResult){
			if(err)
			{
				findResult=[];
			}
			res.render("blogList",{
			title:"历史博客",
			user:req.session.user,
			posts:findResult
			});
		})
		
	});
	
	app.post("/blogList",function(req,res){
		if(req.body.handle=="delete"){
			Post.delItem({index:Number(req.body.index)},function(err){
				if(err)
				{
					req.flash("error",err);
				}
				else
				{
					req.flash("success","删除成功")
				}
				res.send({data:true});
			});
		}
	})
	
	app.get("/about",function(req,res){
		res.render("about",{
			user:req.session.user,
			title:"关于作者"
		});
	});
	
	function checkLogin(req,res,next){
		if(!req.session.user){
			req.flash('error','未登录！');
			res.redirect('/login');
		}
		next();
	}
	function checkNotLogin(req,res,next){
		if(req.session.user){
			req.flash('error','已登录！');
			res.redirect('back');
		}
		next();
	}
}