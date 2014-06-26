// JavaScript Document

//mobileinit
$(document).bind("mobileinit",function(){
	//alert("jquerymobile init")
	$.mobile.notesdb=openDatabase("trnotes12","1.0","Travel Notes ",10*1024*1024);
	
	$.mobile.notesdb.transaction(function(t){

        var sqlstr="CREATE TABLE IF NOT EXISTS notes (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,title TEXT NOT NULL,details TEXT NOT NULL," +
            "entered TEXT NOT NULL,updated TEXT,latitude REAL,longitude REAL,photourl TEXT,audiourl TEXT,videourl TEXT);";
        t.executeSql(sqlstr);
	});

    $.mobile.notesdb.transaction(function(t){
        t.executeSql("SELECT id,title,details,photourl,audiourl,videourl FROM notes ORDER BY id DESC LIMIT ?",[trNotes.limit],function(t,result){
           if (result.rows.length==0){
                var sqlstr = "insert into notes(title,details,entered,photourl,audiourl,videourl,latitude,longitude) "+
                    " values ('游记11','到此一游','2014-06-01','images/nophoto.png','images/hi.mp3','images/hi.3gp',23.204,113.322);";
                t.executeSql(sqlstr);
                sqlstr = "insert into notes(title,details,entered,photourl,audiourl,videourl,latitude,longitude) "+
                    " values ('游记22','到此二游','2014-06-02','images/nophoto.png','images/hi.mp3','images/hi.3gp',23.200,113.318);";
                t.executeSql(sqlstr);
                sqlstr = "insert into notes(title,details,entered,photourl,audiourl,videourl,latitude,longitude) "+
                    " values ('游记33','到此三游','2014-06-03','images/nophoto.png','images/hi.mp3','images/hi.3gp',23.196,113.314);";
                t.executeSql(sqlstr);
        }
        });

    });
	
	//$("[data-role=footer]").fixedtoolbar({ tapToggle: false });
	$.mobile.fixedToolbars.setTouchToggleEnabled(false);
	 //$.mobile.showPageLoadingMsg();
});


$(function(){
	$("#home").live("pagebeforeshow",showMapNote);
	$("#new").live("pageshow",getLocation);
	//$("#insert").live("submit",insertEntry);
	//$("#photo").live("click",getPhoto);
	$("#photo").live("tap",getPhoto);
    $("#audio").live("tap",getAudio);
    $("#video").live("tap",getVideo);
    $("#btnAddNote").live("click",insertEntry);
	$("#travellist").live("pageshow",getTitles);
	$("#editItem").live("click",editItem);
	$("#delete").live("click",deleteItem);
	$("#update").live("click",updateItem);
	$("#limit").live("click",swapList);
    $("#timeline").live("click",showTimeline);
	
});




//location
var trNotes={
	lat:23.204,
	lng:113.322,
	limit:20
};


function showMapNote(){
	
	//alert("map page -pagebeforeshow");
	if(!map) return;
	$.mobile.notesdb.transaction(function(t){
		t.executeSql("SELECT * FROM notes ORDER BY id DESC LIMIT ?",[trNotes.limit],function(t,result){
				getGraphics(result)
		});
	});
}


function showTimeline(){
    $.mobile.changePage("#home","slideup",false,true);
    if(!map) return;
    $.mobile.notesdb.transaction(function(t){
        t.executeSql("SELECT * FROM notes ORDER BY id DESC LIMIT ?",[trNotes.limit],function(t,result){
            timeline(result)
        });
    });
}

function getTitles(){
	var list=$("#recent"),items=[];
	
	$.mobile.notesdb.transaction(function(t){
		t.executeSql("SELECT id,title,details,photourl,audiourl,videourl FROM notes ORDER BY id DESC LIMIT ?",[trNotes.limit],function(t,result){
			var i,len=result.rows.length,row;
			
			if(len>0){
				for(i=0;i<len;i+=1){
					row=result.rows.item(i);
					photo=row.photourl;
                    audio=row.audiourl;
                    vidoe=row.videourl;
					if(!photo)
					  photo="images/nophoto.png";
                    if(!audio)
                      audio="images/hi.mp3";
                    if(!video)
                      video="images/hi.3gp";
					content=row.details.substring(0,10);
					items.push("<li><a href='#display' data-trnote='"+row.id+"'><img src='"+photo+"'/><h3>"+row.title+"</h3><p>"+content+"</p></a></li>");
				}
				list.html(items.join(" "));
				
				list.listview("refresh");
				
				$("a",list).live("click",function(e){
					getItem(($(this).attr("data-trnote")));
				});
				
				$("#entries").show();
				$("#recent").show();

			}
			else
			{
				$("#entries").hide();
				$("#recent").hide();
			}
		});
	});
}

function getLocation(){
	if(!navigator.geolocation){
		alert("can not use geolocation");
		return;
	}
	navigator.geolocation.getCurrentPosition(locSuccess,locFail,{enableHighAccuracy:false});
    navigator.geolocation.watchPosition(locSuccess, locFail,{maximumAge:0, timeout:30000, enableHighAccuracy:true});
}

function locSuccess(position){
	trNotes.lat=position.coords.latitude;
	trNotes.lng=position.coords.longitude;
    map.panTo(new BMap.Point(trNotes.lng,trNotes.lat));
}

function locFail(error){
	var msg="Cannot determine location.";
    console.log(error);
	if(error.code==error.PERMISSION_DENIED)
	{
		msg+="Geolocation is disabled.";
	}
	try{
		navigator.notification.alert(mag,null,"Geolocation");
	}catch(e){
		alert(msg);
	}
}

function insertEntry(e){
	var title=$("#title").val(),
		details=$("#details").val(),
		photo=$("#myPhoto").attr("src"),
        audio=$("#myaudio").attr("src"),
        video=$("#myvideo").attr("src");
	 //alert(photo);
	if(!title)
		title="无";
	if(!details)
		details="无";
	 if(!photo)
	 	photo="images/nophoto.png";
     if(!audio)
        audio="images/hi.mp3";
    if(!video)
        video="images/hi.3gp"

    console.log("audio:"+audio);
    console.log("video:"+video);
    console.log("title:"+title);

	$.mobile.notesdb.transaction(function(t){
		t.executeSql("INSERT into notes (title,details,entered,latitude,longitude,photourl,audiourl,videourl)" +
            " VALUES(?,?,date('now'),?,?,?,?,?);",[title,details,trNotes.lat,trNotes.lng,photo,audio,video],
		function(){
			$.mobile.changePage("#home","slide",false,true);
			$("#title").val("");
			$("#details").val("");
			$("myPhoto").css("display","none");
		},null);
	});
	e.preventDefault();
}


function getItem(id){
	$.mobile.notesdb.transaction(function(t){
		t.executeSql("SELECT * FROM notes WHERE id=?",[id],function(t,result){
			var row=result.rows.item(0),entered=convertToMDY(row.entered),updated=row.updated;
			var photo;
			opts={};
			$("#display h1").text(row.title);
			$("#display article").text(row.details);
			photo=row.photourl;
            audio=row.audiourl;
            video=row.videourl;
			if(!row.photourl)
				photo="images/nophoto.png";
            if(!row.audiourl)
               audio="images/hi.mp3";
            if(!row.videourl)
                video="image/hi.3gp";
			$("#displayphoto").attr("src",photo);//.src=row.photourl;
            $("#displayaudio").attr("src",audio);
            $("#displayvideo").attr("src",video);
            console.log(audio);
            console.log(video);
			//alert("DISPLAYS"+row.photourl);
			/*if(row.latitude==null){
				$("#showmap").parent("p").hide();
			}else{
				$("#showmap").parent("p").show();
				opts.title=row.title;
				opts.lat=row.latitude;
				opts.lng=row.longitude;
				
				$("#showmap").unbind("click");
				$("#showmap").click(opts,displayMap);
			}*/
			
			$("#display footer").html("<p>创建时间:"+entered+"</p>");
			
			if(updated!=null){
				updated=convertToMDY(updated);
				
				$("#display footer").append("<p>修改时间:"+updated+"</p>");
			}
			
			$("#delete,#update").attr("data-trnote",id);
			
			$("#title2").val(row.title);
			$("#details2").val(row.details);
		});
	});
}


function convertToMDY(date){
	var d=date.split("-");
	return d[1]+"/"+d[2]+"/"+d[0];
}

function displayMap(e){
	var title=e.data.title,
	latlng=e.data.lat+","+e.data.lng;
	
	if(typeof device !="undefined"&& device.platform.toLowerCase()=="android"){
		window.location="http://maps.google.com/maps?z=16&q="+encodeURIComponent(title)+"@"+latlng;
	}else{
		$("#map h1").text(title);
		$("#map div[data-role=content]").html("<img src='http://maps.google.com/maps/api/staticmap?center="+latlng+"&zoom=16&size=320x420&markers="+latlng+"&sensor=false'>");
		
		$.mobile.changePage("#map","fade",false,true);
	}
}


function editItem(){
	$.mobile.changePage("#editNote","slideup",false,true);
}

function deleteItem(e){
	var id=$(this).attr("data-trnote");
	$.mobile.notesdb.transaction(function(t){
		t.executeSql("DELETE FROM notes WHERE id=?",[id],$.mobile.changePage("#travellist","slide",false,true),null);
	});
	
	e.preventDefault();
}

function updateItem(e){
	var title=$("#title2").val(),details=$("#details2").val(),id=$(this).attr("data-trnote");
	
	$.mobile.notesdb.transaction(function(t){
		t.executeSql("UPDATE notes SET title=?,details=?,updated=date('now') WHERE id=?",[title,details,id],$.mobile.changePage("#travellist","flip",false,true),null);
	});
	
	e.preventDefault();
}


function swapList(){
	var btn=$("#limit .ui-btn-text");
	if(btn.text()=="全部"){
		btn.text("最近");
		//$("#entries h2").text("全部日记");
		trNotes.limit=-1;
	}else{
		btn.text("全部");
		//$("#entries h2").text("最近");
		trNotes.limit=10;
	}
	getTitles();
}


function getPhoto(){
	//alert("click getPhoto");
	if(!navigator.camera) {
		alert("camera can not use");
		return;
	}
	navigator.camera.getPicture(onSuccess, onFail, { quality: 50, destinationType: Camera.DestinationType.FILE_URI });

	function onSuccess(imageData) {
		//alert("camer successful!!!");
		//alert(imageData);
		var newnote=$("#newNote");
		var src=imageData;
		//var src="data:image/jpeg;base64," + imageData;
		var img=$("#myPhoto");
		img.attr("src",src);
		img.css("display","block");
		//var img="<img src="+src+"/>";
		//newnote.append(img);
		newnote.listview("refresh");
	  
	}

	function onFail(message) {
	   alert(' carema Failed because: ' + message);
	}



}

function getAudio(){
    var durationmax =30;
    var limition=1;
    if (!navigator.device.capture){
        alert("无法录音");
        return;
    }
    navigator.device.capture.captureAudio(captureSuccess, captureError,{limit:limition,duration:durationmax});
}
function getVideo(){
    var durationmax =30;
    var limition=1;
    if (!navigator.device.capture){
        alert("无法录像");
        return;
    }
    navigator.device.capture.captureVideo(captureSuccess, captureError,{limit:limition,duration:durationmax});
}
function captureSuccess(mediaFiles){
    var i, len;
    var mediatype;
    mediatype = mediaFiles[0].type.substr(0,5);

    mediatype = mediaFiles[0].type.substr(0,5);
    if (mediatype=="video"){
        $("#myvideo").attr("src",mediaFiles[0].fullPath);
        console.log("cap video"+mediaFiles[0].fullPath);
    }
    else if (mediatype=="audio"){
        $("#myaudio").attr("src",mediaFiles[0].fullPath);
        console.log("cap audio"+mediaFiles[0].fullPath);
    }

}
// 采集操作出错后的回调函数
function captureError(error) {
    var msg = '捕获时发生错误: ' + error.code;
    alert(msg);
}