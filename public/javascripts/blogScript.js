$(function(){
	
	
	
	//向服务器发送编辑请求
	$(".delete").click(function(){
		let postItem={
			handle:$(this).attr("class"),
			index:$(this).attr("data-index")
		};
		$.ajax({
			type:"POST",
			url:"/blogList",
			data:postItem,
			dataType:"json",
			success:function(data){
				location.reload();
			}
		});
		
	});
	$(".edit").click(function(){
		window.location.href="/post?handle=edit&index="+$(this).attr("data-index");
	});
	//添加验证注册信息
	checkRegister();
	
	
	
	function checkRegister(){
	//添加注册验证
		$("input").focus(function(){
			$(this).closest('dl').children("dd:first").text("");
		});
		$("input").blur(function(){
			$(this).css("border","thin inset #D3D3D3");
		});
		

		$(":submit").click(function(event){
			let userName=$(this).parents('dl').children("dd:eq(1)").children("input").val();
			userName=userName.replace(/([\u4e00-\u9fa5])/gi,$1=>$1+$1);
			let password1=$(this).parents('dl').children("dd:eq(3)").children("input").val();
			let password2=$(this).parents('dl').children("dd:eq(5)").children("input").val();
			let checkName=userName.match(/^[a-zA-Z\u4e00-\u9fa5][a-zA-Z0-9\u4e00-\u9fa5]{5,17}/gi);
			let checkPassword1=password1.match(/.{6,16}/gi);
			let checkPassword2=password2.match(/.{6,16}/gi);
			if(!checkName)
			{
				event.preventDefault();
				$(this).parents('dl').children("dd:eq(1)").children("input").css("borderColor","red");
				$(this).closest('dl').children("dd:first").text("请修改红色部分内容");
			}
			if(!checkPassword1)
			{
				event.preventDefault();
				$(this).parents('dl').children("dd:eq(3)").children("input").css("borderColor","red");
				$(this).closest('dl').children("dd:first").text("请修改红色部分内容");
			}
			if(!checkPassword2)
			{
				event.preventDefault();
				$(this).parents('dl').children("dd:eq(5)").children("input").css("borderColor","red");
				$(this).closest('dl').children("dd:first").text("请修改红色部分内容");
			}
			if(password1!==password2)
			{
				event.preventDefault();
				$(this).parents('dl').children("dd:eq(3)").children("input").css("borderColor","red");
				$(this).parents('dl').children("dd:eq(5)").children("input").css("borderColor","red");
				$(this).closest('dl').children("dd:first").text("请修改红色部分内容");
			}
		});
	}
})