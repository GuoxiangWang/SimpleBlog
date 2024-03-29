var mongodb=require('./db');

function Comment(name,comment){
	this.name=name;
	this.comment=comment;
}

function Post(name,title,post){
	this.name=name;
	this.title=title;
	this.post=post;
}

module.exports=[Post,Comment];


//添加一条评论信息
Comment.prototype.save=function(kvPair,callback){
	var date=new Date();
	var time={
		date:date,
		year:date.getFullYear(),
		month:date.getFullYear()+"-"+(date.getMonth()+1),
		day:date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate(),
		minute:date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate()+"-"+date.getHours()+":"+(date.getMinutes()<10?"0"+date.getMinutes():date.getMinutes())
	};
	var comment={
		name:this.name,
		comment:this.comment,
		time:time
	};
	mongodb.open(function(err,db){
		if(err){
			return callback(err);
		}
		db.collection("posts",function(err,collection){
			if(err)
			{
				mongodb.close();
				return callback(err);
			}
			collection.update(kvPair,{$push:{'comments':comment}});
			//collection.find(kvPair).toArray(function(err,docs){
			//	if(err)
			//	{
			//		return callback(err);
			//	}
				mongodb.close();
				callback(null);

			//
				
				//callback(null);
			//});
			
			
			
		})
			
	});
	
}


//存储一篇文章及其相关信息
Post.prototype.save=function(callback){
	var date=new Date();
	//存储各种时间格式，方便以后扩展
	var time={
		date:date,
		year:date.getFullYear(),
		month:date.getFullYear()+"-"+(date.getMonth()+1),
		day:date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate(),
		minute:date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate()+"-"+date.getHours()+":"+(date.getMinutes()<10?"0"+date.getMinutes():date.getMinutes())
	};
	//要存入数据库的文档
	var post={
				name:this.name,
				time:time,
				title:this.title,
				post:this.post
			};
	//打开数据库
	mongodb.open(function(err,db){
		if(err){
			return callback(err);
		}
		//读取posts集合
		db.collection('posts',function(err,collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			collection.find().toArray(function(err,docs){
				if(err)
				{
					return callback(err);
				}
				post.comments=[];
				post.index=docs.length;
				//将文档插入posts集合
				collection.insert(post,{
					safe:true
				},function(err){
					mongodb.close();
					if(err){
						return callback(err); //失败，返回err
					}
					callback(null);  //返回err为null
				});
			});
			
		});
	});
};



//读取文章及相关信息
Post.get=function(name,callback){
	//打开数据库
	mongodb.open(function(err,db){
		if(err){
			return callback(err);
		}
		//读取post集合
		db.collection('posts',function(err,collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			var query={};
			if(name){
				query.name=name;
			}
			//根据query对象查询文章
			collection.find(query).sort({
				time:-1
			}).toArray(function(err,docs){
				mongodb.close();
				if(err){
					return callback(err); //失败，返回err
				}
				callback(null,docs);//成功，以数组形式返回查询结果
			});
		})
	});
};

Post.find=function(kvPair,callback){
	//打开数据库
	mongodb.open(function(err,db){
		if(err){
			return callback(err);
		}
		db.collection('posts',function(err,collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			collection.find(kvPair).toArray(function(err,docs){
				mongodb.close();
				if(err)
				{
					return callback(err);
				}
				callback(null,docs);
			});
			
		});	
	});
};


Post.delItem=function(kvPair,callback){
	mongodb.open(function(err,db){
		if(err)
		{
			return callback(err);
		}
		db.collection("posts",function(err,collection){
			if(err)
			{
				mongodb.close();
				return callback(err);
			}
			collection.remove(kvPair);
			collection.update({"index":{$gt:kvPair.index}},{$inc:{"index":-1}});
			mongodb.close();
			callback(null);
		});
	});
}