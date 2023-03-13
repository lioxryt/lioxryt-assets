"use strict";SharkGame.Recycler={tabId:"recycler",tabDiscovered:!1,tabSeen:!1,tabName:"Recycler",tabBg:"img/bg/bg-recycler.png",sceneImage:"img/events/misc/scene-recycler.png",discoverReq:{upgrade:["recyclerDiscovery"]},message:"Convert things into residue, and residue into things!<br/><span class='medDesc'>Feed the machines. Feed them.</span>",recyclerInputMessages:["The machines grind and churn.","Screech clunk chomp munch erp.","Clunk clunk clunk screeeeech.","The recycler hungrily devours the stuff you offer.","The offerings are no more.","Viscous, oily mess sloshes within the machine.","The recycler reprocesses."],recyclerOutputMessages:["A brand new whatever!","The recycler regurgitates your demand, immaculately formed.","How does a weird blackish gel become THAT?","Some more stuff to use! Maybe even to recycle!","Gifts from the machine! Gifts that may have cost a terrible price!","How considerate of this unfeeling, giant apparatus! It provides you stuff at inflated prices!"],allowedCategories:{machines:"linear",stuff:"constant",processed:"constant",animals:"constant"},bannedResources:["essence","junk","science","seaApple","coalescer","ancientPart","filter","world","sacrifice","aspectAffect"],efficiency:"NA",hoveredResource:"NA",expectedOutput:"NA",expectedJunkSpent:"NA",init(){SharkGame.TabHandler.registerTab(this)},setup(){},switchTo(){const e=$("#content");e.append($("<div>").attr("id","tabMessage"));const t=$("<div>").attr("id","recyclerContainer");t.append($("<div>").attr("id","inputButtons")),t.append($("<div>").attr("id","junkDisplay")),t.append($("<div>").attr("id","outputButtons")),e.append(t),e.append($("<div>").addClass("clear-fix"));let r=rec.message;const c=$("#tabMessage");SharkGame.Settings.current.showTabImages&&(r="<img width=400 height=200 src='"+rec.sceneImage+"' id='tabSceneImageRed'>"+r,c.css("background-image","url('"+rec.tabBg+"')")),c.html(r),main.createBuyButtons("eat",t,"prepend"),rec.createButtons()},update(){rec.updateExpectedOutput(),rec.updateExpectedJunkSpent(),rec.updateJunkDisplay(),rec.updateButtons()},updateJunkDisplay(){const e=res.getResource("junk"),t=$("#junkDisplay");let r="";r="NA"!==rec.expectedOutput&&0!==rec.expectedOutput?"<span class='click-passthrough' style='color:#FFE436'>"+sharktext.beautify(e+rec.expectedOutput)+"</span> ":"NA"!==rec.expectedJunkSpent&&0!==rec.expectedJunkSpent?"<span class='click-passthrough' style='color:#FFE436'>"+sharktext.beautify(e-rec.expectedJunkSpent)+"</span> ":sharktext.beautify(e);const c="CONTAINS:<br/>"+r.bold()+" RESIDUE<br/><br/>"+rec.getRecyclerEfficiencyString()+rec.getTarString().bold();t.html()!==c.replace(/'/g,'"').replace(/<br\/>/g,"<br>")&&t.html(c)},updateButtons(){SharkGame.ResourceMap.forEach(((e,t)=>{if(res.getTotalResource(t)>0){const e=$("#input-"+t);if(0===e.length)return!0;const r=$("#output-"+t),c=new Decimal(res.getResource(t)),a=new Decimal(sharkmath.getBuyAmount());let s=a,o=a;const n=rec.getMaxToBuy(t);if(a<0){const e=a.round().times(-1);s=c.dividedBy(e).round(),o=n.dividedBy(e).round()}let u=c.lessThan(s)||s.lessThanOrEqualTo(0),i="Recycle ";s.greaterThan(0)&&("NA"===rec.expectedJunkSpent||0===rec.expectedJunkSpent||u||t!==rec.hoveredResource?i+=sharktext.beautify(Number(s))+" ":i+=a<0?"<span class='click-passthrough' style='color:#FFDE0A'>"+sharktext.beautify(Number(s.plus(o).dividedBy(a.times(-1))))+"</span> ":"<span class='click-passthrough' style='color:#FFDE0A'>"+sharktext.beautify(Number(s))+"</span> "),u?e.addClass("disabled"):e.removeClass("disabled"),i+=sharktext.getResourceName(t,u,a,sharkcolor.getElementColor("input-"+t,"background-color")),e.html()!==i.replace(/'/g,'"')&&e.html(i),u=n.lessThan(o)||o.lessThanOrEqualTo(0),i="Convert to ",o>0&&("NA"===rec.expectedOutput||0===rec.expectedOutput||u?i+=sharktext.beautify(Number(o))+" ":i+="<span class='click-passthrough' style='color:#FFDE0A'>"+sharktext.beautify(Number(o))+"</span> "),u?r.addClass("disabled"):r.removeClass("disabled"),i+=sharktext.getResourceName(t,u,a,sharkcolor.getElementColor("output-"+t,"background-color")),r.html()!==i.replace(/'/g,'"')&&r.html(i)}}))},createButtons(){const e=$("#inputButtons"),t=$("#outputButtons");SharkGame.ResourceMap.forEach(((r,c)=>{res.getTotalResource(c)>0&&rec.allowedCategories[res.getCategoryOfResource(c)]&&-1===rec.bannedResources.indexOf(c)&&(SharkGame.Button.makeHoverscriptButton("input-"+c,"Recycle "+sharktext.getResourceName(c,void 0,void 0,sharkcolor.getVariableColor("--color-light")),e,rec.onInput,rec.onInputHover,rec.onInputUnhover),SharkGame.Button.makeHoverscriptButton("output-"+c,"Convert to "+sharktext.getResourceName(c,void 0,void 0,sharkcolor.getVariableColor("--color-light")),t,rec.onOutput,rec.onOutputHover,rec.onOutputUnhover))}))},onInput(){const e=$(this);if(e.hasClass("disabled"))return;const t=e.attr("id").split("-")[1],r=res.getResource(t),c=SharkGame.ResourceMap.get(t).value,a=sharkmath.getPurchaseAmount(t);r>=a*(1-SharkGame.EPSILON)?(res.changeResource("junk",a*c*rec.getEfficiency()),res.changeResource(t,-a),res.changeResource("tar",Math.max(a*c*2e-7+res.getProductAmountFromGeneratorResource("filter","tar"),0)),log.addMessage(SharkGame.choose(rec.recyclerInputMessages))):log.addError("Not enough resources for that transaction. This might be caused by putting in way too many resources at once."),rec.updateEfficiency(t),e.addClass("disabled")},onOutput(){const e=$(this);if(e.hasClass("disabled"))return;const t=e.attr("id").split("-")[1],r=new Decimal(res.getResource("junk")),c=new Decimal(SharkGame.ResourceMap.get(t).value);if("NA"!==rec.expectedOutput)return;const a=new Decimal(sharkmath.getBuyAmount());let s=a;if(a<0){const e=a.round().times(-1);s=rec.getMaxToBuy(t).dividedBy(e)}const o=new Decimal(res.getResource(t));let n;const u=rec.allowedCategories[res.getCategoryOfResource(t)];"linear"===u?n=sharkmath.linearCost(o,s,c):"constant"===u&&(n=sharkmath.constantCost(o,s,c)),r.greaterThanOrEqualTo(n.times(1-SharkGame.EPSILON))?(res.changeResource(t,Number(s)),res.changeResource("junk",-Number(n)),log.addMessage(SharkGame.choose(rec.recyclerOutputMessages))):log.addMessage("You don't have enough for that!"),e.addClass("disabled")},getMaxToBuy(e){const t=new Decimal(res.getResource(e)),r=new Decimal(SharkGame.ResourceMap.get(e).value);let c=new Decimal(res.getResource("junk"));"NA"!==rec.expectedOutput&&(c=c.plus(rec.expectedOutput));const a=res.getCategoryOfResource(e);let s=new Decimal(0);if(rec.allowedCategories[a]){const e=rec.allowedCategories[a];"linear"===e?s=sharkmath.linearMax(t,c,r).minus(t):"constant"===e&&(s=sharkmath.constantMax(t,c,r).minus(t))}return s.round()},onInputHover(){const e=$(this),t=e.attr("id").split("-")[1];e.is(".disabled")||(rec.hoveredResource=t,rec.updateEfficiency(t),rec.updateExpectedOutput())},onInputUnhover(){rec.efficiency="NA",rec.hoveredResource="NA",rec.expectedOutput="NA"},onOutputHover(){const e=$(this),t=e.attr("id").split("-")[1];e.is(".disabled")||(rec.efficiency="NA",rec.hoveredResource=t,rec.updateExpectedJunkSpent())},onOutputUnhover(){rec.hoveredResource="NA",rec.expectedJunkSpent="NA"},getTarString(){const e=sharkmath.getBuyAmount();if("abandoned"===world.worldType){if("NA"===rec.efficiency)return"<br/><br/><br/><br/>";const t=-res.getProductAmountFromGeneratorResource("filter","tar");let r=2e-7*SharkGame.ResourceMap.get(rec.hoveredResource).value;r*=e>0?e:res.getResource(rec.hoveredResource)/-e;let c=sharktext.beautify(r);return c="<br/><br/>AND "+c.bold()+" "+sharktext.getResourceName("tar",void 0,void 0,sharkcolor.getElementColor("junkDisplay")),t>0&&(c+="<br/>("+sharktext.beautify(Math.max(r-t,0))+" "+sharktext.getResourceName("tar",void 0,void 0,sharkcolor.getElementColor("junkDisplay"))+" WITH<br/>"+sharktext.getResourceName("filter",!1,2,sharkcolor.getElementColor("junkDisplay"))+")"),c}return""},getRecyclerEfficiencyString(){if("NA"===rec.efficiency||"NA"===rec.hoveredResource||0===rec.expectedOutput)return"<br/><br/><br/><br/><br/><br/>";let e="";return e=sharkmath.getBuyAmount()>0?sharktext.beautify(rec.efficiency*sharkmath.getBuyAmount()):sharktext.beautify(rec.efficiency*res.getResource(rec.hoveredResource)/-sharkmath.getBuyAmount()),(100*rec.getEfficiency()).toFixed(2).toString().bold()+"<b>%<br/>EFFICIENCY</b><br/><br/>EQUIVALENT TO:<br/>"+e.bold()+" "+sharktext.getResourceName(rec.hoveredResource,void 0,void 0,sharkcolor.getElementColor("junkDisplay")).bold()+"<br/>WORTH OF RESIDUE"},updateExpectedOutput(){const e=rec.hoveredResource;if("NA"===e||"NA"!==rec.expectedJunkSpent)return void(rec.expectedOutput="NA");const t=res.getResource(e),r=sharkmath.getBuyAmount();if(r>0)rec.expectedOutput=r<=t?0:r*rec.getEfficiency()*SharkGame.ResourceMap.get(e).value;else{const c=t/-r;if(c<1)return void(rec.expectedOutput=0);rec.expectedOutput=c*rec.getEfficiency()*SharkGame.ResourceMap.get(e).value}},updateExpectedJunkSpent(){const e=rec.hoveredResource;if("NA"===e||"NA"!==rec.expectedOutput)return void(rec.expectedJunkSpent="NA");const t=new Decimal(sharkmath.getBuyAmount()),r=rec.getMaxToBuy(e),c=new Decimal(res.getResource(e)),a=new Decimal(SharkGame.ResourceMap.get(e).value);if(t>0)if(t<=r)switch(rec.allowedCategories[res.getCategoryOfResource(e)]){case"constant":rec.expectedJunkSpent=Number(t*a);break;case"linear":rec.expectedJunkSpent=Number(sharkmath.linearCost(c,t,a))}else rec.expectedJunkSpent=0;else{const s=r.dividedBy(t.times(-1)).round();if(0===s)return void(rec.expectedJunkSpent=0);switch(rec.allowedCategories[res.getCategoryOfResource(e)]){case"constant":rec.expectedJunkSpent=Number(s.times(a));break;case"linear":rec.expectedJunkSpent=Number(sharkmath.linearCost(c,s,a))}}rec.expectedJunkSpent<0&&(rec.expectedJunkSpent=0)},getEfficiency:()=>"NA"===rec.efficiency?1:(rec.updateEfficiency(rec.hoveredResource),rec.efficiency.toFixed(4)),updateEfficiency(e){let t=5,r=.5;SharkGame.Upgrades.purchased.includes("superprocessing")&&(t=8,r=1);const c=sharkmath.getPurchaseAmount(e);c<=Math.pow(10,t)?rec.efficiency=r:rec.efficiency=1/(Math.log10(c)-t+Math.round(1/r))}};