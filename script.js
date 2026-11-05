const WHATSAPP = "967779563062";
const ADMIN_PASSWORD = "1234"; // غيّر كلمة المرور قبل نشر الموقع
const starterProducts = [
  {id:1,name:"طباعة الأكواب",category:"printing",price:4000,description:"طباعة الصور والأسماء والشعارات على الأكواب.",image:""},
  {id:2,name:"طباعة الملابس",category:"printing",price:0,description:"طباعة مخصصة على الملابس حسب الطلب.",image:""},
  {id:3,name:"ملصقات المنتجات",category:"printing",price:0,description:"ملصقات لمنتجات المحلات والمشاريع.",image:""},
  {id:4,name:"كروت العمل",category:"printing",price:27500,description:"تصميم وطباعة كروت العمل حسب الكمية.",image:""},
  {id:5,name:"كروت التوزيعات",category:"printing",price:0,description:"كروت أنيقة للمناسبات والتوزيعات.",image:""},
  {id:6,name:"تصميم شعار وهوية",category:"design",price:0,description:"تصميم شعار وهوية بصرية لمشروعك.",image:""},
  {id:7,name:"تصميم سيرة ذاتية",category:"design",price:0,description:"إعداد وتصميم سيرة ذاتية احترافية.",image:""},
  {id:8,name:"تصميم دعوات المناسبات",category:"design",price:0,description:"دعوات للمناسبات بتصميم حسب رغبتك.",image:""},
  {id:9,name:"أكياس قماشية",category:"services",price:0,description:"توفير وتجهيز أكياس قماشية حسب الطلب.",image:""},
  {id:10,name:"أكياس بلاستيكية",category:"services",price:0,description:"أكياس للمحلات والمشاريع حسب الطلب.",image:""},
  {id:11,name:"هدايا مخصصة",category:"gifts",price:0,description:"هدايا بالأسماء والصور والشعارات.",image:""}
];
const categoryNames={printing:"الطباعة",design:"التصميم",services:"الخدمات",gifts:"الهدايا"};
const read=(key,fallback)=>{try{const x=localStorage.getItem(key);return x?JSON.parse(x):fallback}catch{return fallback}};
let products=read("baouqeed_products",starterProducts);
let cart=read("baouqeed_cart",[]);
let adminMode=false, activeFilter="all", pendingImage="";
const $=id=>document.getElementById(id);
const save=()=>localStorage.setItem("baouqeed_products",JSON.stringify(products));
const money=n=>Number(n)>0?Number(n).toLocaleString("en-US")+" ر.ي":"حسب الطلب";
function renderProducts(){
  const shown=products.filter(p=>activeFilter==="all"||p.category===activeFilter);
  $("productGrid").innerHTML=shown.map(p=>`
    <article class="product-card">
      <button class="delete-product" data-delete="${p.id}" aria-label="حذف المنتج">حذف</button>
      <div class="product-image">${p.image?`<img src="${p.image}" alt="${escapeHtml(p.name)}">`:"✧"}</div>
      <div class="product-info"><h3>${escapeHtml(p.name)}</h3><p>${escapeHtml(p.description||"متوفر حسب الطلب")}</p>
        <div class="product-meta"><span class="price">${money(p.price)}</span><button class="add-cart" data-add="${p.id}">أضف للسلة</button></div>
      </div>
    </article>`).join("");
  $("emptyState").hidden=shown.length>0;
}
function escapeHtml(s=""){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function renderCart(){
  $("cartCount").textContent=cart.reduce((a,x)=>a+x.qty,0);
  $("cartItems").innerHTML=cart.length?cart.map(x=>`<div class="cart-row"><span>${escapeHtml(x.name)} × ${x.qty}<br><b>${money(x.price*x.qty)}</b></span><span><button data-remove="${x.id}">حذف</button></span></div>`).join(""):"<p class='muted'>السلة فارغة حاليًا.</p>";
  const total=cart.reduce((a,x)=>a+(Number(x.price)||0)*x.qty,0);
  $("cartTotal").textContent=total.toLocaleString("en-US")+" ر.ي";
  localStorage.setItem("baouqeed_cart",JSON.stringify(cart));
}
document.addEventListener("click",e=>{
  const add=e.target.closest("[data-add]");
  if(add){const p=products.find(x=>x.id===Number(add.dataset.add));if(p){const found=cart.find(x=>x.id===p.id);found?found.qty++:cart.push({...p,qty:1});renderCart();$("cartOverlay").classList.add("show");}}
  const del=e.target.closest("[data-delete]");
  if(del&&adminMode&&confirm("هل تريد حذف هذا المنتج؟")){products=products.filter(x=>x.id!==Number(del.dataset.delete));save();renderProducts();}
  const rem=e.target.closest("[data-remove]");
  if(rem){cart=cart.filter(x=>x.id!==Number(rem.dataset.remove));renderCart();}
});
$("filters").addEventListener("click",e=>{const b=e.target.closest("[data-filter]");if(!b)return;activeFilter=b.dataset.filter;document.querySelectorAll(".filter").forEach(x=>x.classList.toggle("active",x===b));renderProducts();});
$("cartOpen").onclick=()=>$("cartOverlay").classList.add("show");
$("cartClose").onclick=()=>$("cartOverlay").classList.remove("show");
$("cartOverlay").addEventListener("click",e=>{if(e.target===$("cartOverlay"))$("cartOverlay").classList.remove("show");});
$("checkout").onclick=()=>{
  if(!cart.length){alert("أضف منتجات إلى السلة أولًا.");return;}
  const lines=cart.map(x=>`- ${x.name} | الكمية: ${x.qty} | السعر: ${money(x.price*x.qty)}`);
  const total=cart.reduce((a,x)=>a+(Number(x.price)||0)*x.qty,0);
  const msg=`السلام عليكم، أرغب بطلب المنتجات التالية من متجر باوقيد:\n${lines.join("\n")}\nالإجمالي المعروف: ${total.toLocaleString("en-US")} ر.ي\nيرجى تأكيد الأسعار وتفاصيل الطلب.`;
  window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`,"_blank");
};
$("adminOpen").onclick=()=>$("adminOverlay").classList.add("show");
$("adminClose").onclick=()=>$("adminOverlay").classList.remove("show");
$("adminOverlay").addEventListener("click",e=>{if(e.target===$("adminOverlay"))$("adminOverlay").classList.remove("show");});
$("loginBtn").onclick=()=>{
  if($("adminPassword").value===ADMIN_PASSWORD){adminMode=true;document.body.classList.add("admin-mode");$("loginArea").hidden=true;$("productForm").hidden=false;}
  else $("loginError").textContent="كلمة المرور غير صحيحة.";
};
$("pFile").addEventListener("change",e=>{
  const file=e.target.files[0];if(!file)return;
  if(file.size>1200000){alert("اختر صورة أقل من 1.2 ميجابايت حتى لا تمتلئ مساحة المتصفح.");e.target.value="";return;}
  const reader=new FileReader();reader.onload=()=>{pendingImage=reader.result;};reader.readAsDataURL(file);
});
$("productForm").addEventListener("submit",e=>{
  e.preventDefault();
  const name=$("pName").value.trim();if(!name)return;
  products.unshift({id:Date.now(),name,category:$("pCategory").value,price:Number($("pPrice").value)||0,description:$("pDescription").value.trim(),image:pendingImage||$("pImage").value.trim()});
  try{save();}catch{alert("تعذر حفظ المنتج. جرّب صورة أصغر.");products.shift();return;}
  e.target.reset();pendingImage="";renderProducts();alert("تمت إضافة المنتج على هذا الجهاز.");
});
$("menuToggle").onclick=()=>$("mainNav").classList.toggle("open");
document.querySelectorAll("#mainNav a").forEach(a=>a.onclick=()=>$("mainNav").classList.remove("open"));
$("year").textContent=new Date().getFullYear();
renderProducts();renderCart();