var map;
//初始化地图
function init() {
  $('#mapcontent').height($(window).height()-92);
  map = new BMap.Map("map");            // 创建Map实例
  var point = new BMap.Point(113.318,23.200);    // 创建点坐标
  map.centerAndZoom(point,15);                     // 初始化地图,设置中心点坐标和地图级别。
  map.addControl(new BMap.ZoomControl());
  showMapNote();
}

//显示标注
function getGraphics(result){
var i,len=result.rows.length,row;

    if(len>0){
        //清除地图上所有覆盖物
        if(map)
            map.clearOverlays();

        var markers = new Array();
        var icons = new Array();
        for(i=0;i<len;i++){
            row=result.rows.item(i);

            var entered=convertToMDY(row.entered),updated=row.updated;
            var title=row.title,content=row.details,
            photo=row.photourl;
            if(row.latitude){
                markers[i] = new BMap.Marker(new BMap.Point(row.longitude,row.latitude));  // 创建标注
                map.addOverlay(markers[i]);              // 将标注添加到地图中
                //创建信息窗口
               var infoWindow1 = new  BMap.InfoWindow("info");
               markers[i].addEventListener("click",showinfo,false);
               function showinfo(){
                   for (j=0;j<len;j++){
                       if ((this.getPosition().lat==result.rows.item(j).latitude)&&(this.getPosition().lng==result.rows.item(j).longitude)){
                           var myGeo = new BMap.Geocoder()  // 将地址解析结果显示在标注上
                           myGeo.getLocation(this.getPosition(), function(GeocoderResult ){
                               if (GeocoderResult ) {
                                   infoWindow1.setContent(infoWindow1.getContent()+"<br>"+GeocoderResult.address);
                               }
                           });
                           infoWindow1.setContent(result.rows.item(j).title+"<br><img height=120 width=200 src='"+result.rows.item(j).photourl+"'>");
                           this.openInfoWindow(infoWindow1);
                       }

                   }

                }
            }
        }
    }
}

//显示旅程
function timeline(result){
    var i,j,len=result.rows.length,row;
    if(len>0){
        //地图放大
       map.setZoom(18);

       var infoWindow1 = new  BMap.InfoWindow("info");
       i=0;
       j=0
      var  sn = setInterval(snode,2000);

      var  sp;
      setTimeout(function(){sp=setInterval(spoly,2000);},1500);


       function snode(){
          map.panTo(new BMap.Point(result.rows.item(i).longitude,result.rows.item(i).latitude));
           infoWindow1.setContent(result.rows.item(i).title+"<br><img height=120 width=200 src='"+result.rows.item(i).photourl+"'>");
           map.openInfoWindow(infoWindow1,new BMap.Point(result.rows.item(i).longitude,result.rows.item(i).latitude));
           i++;
          if (i>=len){
              clearInterval(sn);
          }
       }

       function spoly(){
           if (j<len-1){
               var polyline = new BMap.Polyline([
                   new BMap.Point(result.rows.item(j).longitude,result.rows.item(j).latitude),
                   new BMap.Point(result.rows.item(j+1).longitude,result.rows.item(j+1).latitude)
               ], {strokeColor:"blue", strokeWeight:6, strokeOpacity:0.5});
               map.addOverlay(polyline);
           }
           j++;
           if (j>=len){
               clearInterval(sp);
           }
       }
    }
}



//地图缩放
function doMapZoom(value){
    var level = map.getZoom() + value;
    map.setZoom(level);
}

function orientationChanged() {
    if(map){
      resizeMap();
    }
  }
function resizeMap(){
  if(map){
    $('#map').css("height",screen.height);
    $('#map').css("width","auto");

    map.centerAndZoom(map.getCenter(),map.getZoom());
  }
}

$(document).ready(function(){init();});