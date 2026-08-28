const header=document.querySelector('#header');
const menu=document.querySelector('#menu');
const nav=document.querySelector('#nav');
const lightbox=document.querySelector('#lightbox');
const lightboxImage=lightbox.querySelector('img');
const lightboxLabel=lightbox.querySelector('p');

const updateHeader=()=>header.classList.toggle('solid',window.scrollY>40);
updateHeader();
window.addEventListener('scroll',updateHeader,{passive:true});

menu.addEventListener('click',()=>{
  const open=!nav.classList.contains('open');
  nav.classList.toggle('open',open);
  menu.classList.toggle('open',open);
  menu.setAttribute('aria-expanded',String(open));
  document.body.classList.toggle('lock',open);
});
nav.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{
  nav.classList.remove('open');menu.classList.remove('open');menu.setAttribute('aria-expanded','false');document.body.classList.remove('lock');
}));

document.querySelectorAll('img[data-fallback]').forEach(image=>image.addEventListener('error',()=>{
  if(image.src!==image.dataset.fallback) image.src=image.dataset.fallback;
},{once:true}));

document.querySelectorAll('.photo').forEach(button=>button.addEventListener('click',()=>{
  const image=button.querySelector('img');
  lightboxImage.src=image.currentSrc||image.src;
  lightboxImage.alt=image.alt;
  lightboxLabel.textContent=button.dataset.label||'';
  lightbox.hidden=false;
  document.body.classList.add('lock');
  lightbox.querySelector('button').focus();
}));
const closeLightbox=()=>{lightbox.hidden=true;document.body.classList.remove('lock')};
lightbox.querySelector('button').addEventListener('click',closeLightbox);
lightbox.addEventListener('click',event=>{if(event.target===lightbox) closeLightbox()});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!lightbox.hidden) closeLightbox()});
