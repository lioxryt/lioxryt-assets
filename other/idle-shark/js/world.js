"use strict";SharkGame.World={_worldType:"start",get worldType(){return this._worldType},set worldType(e){const r=document.querySelector("body");r.classList.remove(this._worldType),r.classList.add(e),this._worldType=e},worldResources:new Map,worldRestrictedCombinations:new Map,init(){world.resetWorldProperties(),world.worldType="start"},setup(){res.setResource("world",1),res.setTotalResource("world",1),world.apply(),res.setResource("specialResourceOne",1),res.setTotalResource("specialResourceOne",1),res.setResource("specialResourceTwo",1),res.setTotalResource("specialResourceTwo",1)},apply(){world.applyWorldProperties(),world.applyGateCosts()},resetWorldProperties(){const e=world.worldResources;world.worldRestrictedCombinations.clear(),SharkGame.ResourceMap.forEach(((r,s)=>{e.set(s,{}),e.get(s).exists=!0}))},applyWorldProperties(){const e=world.worldResources,r=SharkGame.WorldTypes[world.worldType];r.includedResources&&(SharkGame.ResourceMap.forEach(((r,s)=>{e.get(s).exists=!1})),_.each(r.includedResources,(r=>{_.has(SharkGame.InternalCategories,r)?_.each(SharkGame.InternalCategories[r].resources,(r=>{e.get(r).exists=!0})):e.get(r).exists=!0}))),_.each(r.absentResources,(r=>{e.get(r).exists=!1})),_.each(r.modifiers,(e=>{res.applyModifier(e.modifier,e.resource,e.amount)})),res.buildIncomeNetwork()},applyGateCosts(){const e=SharkGame.WorldTypes[world.worldType],r=world.getGateCostMultiplier();SharkGame.Gate.createSlots(e.gateRequirements,r)},getWorldEntryMessage:()=>SharkGame.WorldTypes[world.worldType].entry,doesResourceExist:e=>world.worldResources.get(e).exists,forceExistence(e){world.worldResources.get(e).exists=!0},getGateCostMultiplier:()=>1,isScoutingMission:()=>!!SharkGame.flags.scouting||(gateway.completedWorlds.includes(world.worldType)||(SharkGame.flags.scouting=!0),SharkGame.flags.scouting)};