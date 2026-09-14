// Google アナリティクス 4：予約導線のイベント計測（計測タグ本体は各ページの <head> 内）
(()=>{
  const track=(name,params={})=>{if(typeof window.gtag==='function')window.gtag('event',name,params)};
  const placeOf=el=>el.classList.contains('floating')?'floating':el.closest('header')?'header':el.closest('footer')?'footer':el.closest('.hero')?'hero':'content';

  // 「ご予約」「空室・料金を確認」ボタン（#reservation へのリンク）と、Airbnb・Booking.com への移動
  document.addEventListener('click',event=>{
    const link=event.target.closest('a[href]');
    if(!link)return;
    if(/#reservation$/.test(link.getAttribute('href')))track('reserve_button_click',{button_location:placeOf(link)});
    else if(/(^|\.)airbnb\./.test(link.hostname))track('airbnb_click',{button_location:placeOf(link)});
    else if(/(^|\.)booking\.com$/.test(link.hostname))track('bookingcom_click',{button_location:placeOf(link)});
  });

  // ギャラリー写真の拡大表示
  document.querySelectorAll('.photo').forEach(button=>button.addEventListener('click',()=>track('gallery_photo_open',{photo_label:button.dataset.label||''})));

  // 予約エリアが画面に表示された（1ページ表示につき1回）
  const reservationHeading=document.querySelector('#reservation h2');
  if(reservationHeading&&'IntersectionObserver' in window){
    const observer=new IntersectionObserver(entries=>{
      if(!entries.some(entry=>entry.isIntersecting))return;
      track('reservation_view');
      observer.disconnect();
    },{threshold:.5});
    observer.observe(reservationHeading);
  }

  // 自社予約フォーム（Google Apps Script の埋め込み）
  const bookingFrame=document.getElementById('nv11-booking');
  if(!bookingFrame)return;
  let started=false;
  const startBooking=()=>{if(started)return;started=true;track('direct_booking_start')};
  // フォーム内をクリック・タップするとフォーカスがフォームへ移るので、それを「操作開始」とみなす
  window.addEventListener('blur',()=>setTimeout(()=>{if(document.activeElement===bookingFrame)startBooking()},0));
  // フォーム側（apps-script/Booking.html の track）から届く通知
  window.addEventListener('message',event=>{
    try{if(!new URL(event.origin).hostname.endsWith('.googleusercontent.com'))return}catch(error){return}
    const data=event.data;
    if(!data||data.type!=='nv11-booking-event')return;
    const params=data.params||{};
    if(data.name==='start')startBooking();
    if(data.name==='quote'){
      startBooking();
      const result=['available','unavailable','error'].includes(params.result)?params.result:'error';
      track('direct_booking_quote',result==='available'?{quote_result:result,nights:Number(params.nights)||0,guests:Number(params.guests)||0}:{quote_result:result});
    }
    if(data.name==='request')track('direct_booking_request',{nights:Number(params.nights)||0,guests:Number(params.guests)||0,value:Number(params.value)||0,currency:'JPY'});
  });
})();
