/*  handy spot locator
    var loc = document.querySelector('#creature');
    [... loc.parentElement.parentElement.children].indexOf(loc.parentElement)
*/

/* 
    "the" "stage" is a fragmented series of functions
    we've got a little bit of technical debt we're working through so please excuse the mess
*/

var stageEntityNum = 0;
function changeStage(targetStage, spot = false, direction = false){
    body.classList.add('stage-transition')
    flash(true)
    MUI("off")
    env.stage.enemyPause = true
    //console.log(`changing stage to ${targetStage}, target spot is ${spot}`);

    if(env.stages[targetStage].prerenderExec) env.stages[targetStage].prerenderExec()

    //transitions out before proceeding
    setTimeout(()=>{
        body.classList.remove('stage-active')
        //removes the old stage and updates the body styling
        if(env.stage.current) if(env.stage.current.leaveExec) env.stage.current.leaveExec()
        if(document.querySelector('.reference')) document.querySelector('.reference').remove()
        if(document.querySelector('#realgrid')) { 
            document.querySelector('#realgrid').remove()
        } else {
            //initializes if there was no grid before
            env.stage.justStepped = false;
            env.stage.lastMoved = "up";
            env.stage.moveDir = ['up', 'right', 'down', 'left']
        }

        body.id = targetStage
        let stage = env.stages[targetStage];

        //refgrid needs to generate based on the input stage
        var gridGen = "";

        let plan = stage.plan
        if(typeof stage.plan == 'string') plan = stage.plan.replace(/\s/g, '').split('') //new version for more readable plans

        function generateContains(pieceEntity, i) {
            if(!pieceEntity.contains) return ""

            //dynamic prop stylings
            let dypStyle = ""
            let dypClass = ""
            if(pieceEntity.contains.dyp) {
                dypClass += "dypcontent "
                for (const propName in pieceEntity.contains.dyp) {
                    const prop = pieceEntity.contains.dyp[propName];

                    switch(propName) {
                        case "noback":
                        case "cross":
                            dypClass += `dyp-${propName} `
                        break

                        case "class":
                            dypClass += `${prop} `
                        break

                        case "style":
                            dypStyle += `${prop}`
                        break

                        default:
                            dypStyle += `--dyp-${propName}: ${prop};`
                    }
                }
            }

            let contains = `
                <div 
                    id="${pieceEntity.contains.id}${pieceEntity.contains.id=="creature" ? "" : stageEntityNum++}" 
                    class="${pieceEntity.contains.class} ${dypClass}" 
                    type="${pieceEntity.contains.type}" 
                    dialogue="${pieceEntity.contains.dialogue}"
                    style="animation-delay: ${Math.random() * -20}s;${dypStyle}" 
                    origin-spot="${i+1}"
                >
                    ${pieceEntity.contains.examineEntity ? `<div class="target" entity="${pieceEntity.contains.examineEntity}"></div>` : ""}
                    ${pieceEntity.contains.html ? pieceEntity.contains.html : ""}
                </div>
            `

            return contains
        }

        plan.forEach(function(piece, i) {
            //look at the letter
            //if the letter exists in the stage entities, use that
            //if not, use default entities
            var pieceEntity = false;
            var isDynamicProp = false

            if(stage.entities) {
                if(stage.entities[piece]) {
                    pieceEntity = stage.entities[piece];
                }
            }

            if(!pieceEntity) {
                pieceEntity = env.stageEntities[piece];
            }

            if(pieceEntity.contains) if(pieceEntity.contains.dyp) isDynamicProp = true

            if(pieceEntity.teleportTarget) { //you can either specify an examine entity, or contains, but not both. examineEntity is preferred
                let teleportProp = `
                    ${pieceEntity.examineEntity ? `<div class="target" entity="${pieceEntity.examineEntity}"></div>` : ""}
                    ${pieceEntity.contains ? generateContains(pieceEntity, i) : ""}
                `.trim()

                gridGen += `
                    <div 
                        class="gridpiece blocks teleport locked ${pieceEntity.class} ${isDynamicProp ? "dyp" : ""}" 
                        slug="${pieceEntity.slug ? pieceEntity.slug : piece}" 
                        spot="${(typeof pieceEntity.teleportSpot != 'undefined') ? pieceEntity.teleportSpot : false}" 
                        shouldFace="${(typeof pieceEntity.shouldFace != 'undefined') ? pieceEntity.shouldFace : false}" 
                        teleport-target="${pieceEntity.teleportTarget}" 
                        lockflag="${pieceEntity.lockFlag || ""}" 
                        lockexec="${pieceEntity.lockExec || ""}"
                        i="${i}"
                        ${generateAttributes(pieceEntity)}
                    >${teleportProp}</div>
                `
            } else if(pieceEntity.contains) {
                gridGen += `
                    <div class="gridpiece ${pieceEntity.class} ${isDynamicProp ? "dyp" : ""}" slug="${pieceEntity.slug ? pieceEntity.slug : piece}" i="${i}" ${generateAttributes(pieceEntity)}>
                        ${generateContains(pieceEntity, i)}    
                    </div>
                `
            } else {
                gridGen += `<div class="gridpiece ${pieceEntity.class}" slug="${pieceEntity.slug ? pieceEntity.slug : piece}" i=${i} ${generateAttributes(pieceEntity)}></div>`
            }
        });

        //generate + add the grid html, we replace undefined since we don't check for it when making the grid pieces
        let finalGrid = `
        <div class="reference" stage="${targetStage}" id="grid-ref" style="--stageWidth: ${stage.width}">
            ${gridGen.replace(/undefined/, '')} 

            <div class="truecreature">${stage.creature ? stage.creature() : ""}</div> 
        </div>`/* we insert some HTML in the player position graphic (or 'creature') if there is any */

        body.insertAdjacentHTML('beforeend', finalGrid.replaceAll("undefined", ""))

        //handle any special entity spawn-in functions
        if(stage.entities){
            for (const [entity, entityDef] of Object.entries(stage.entities)) {
                if(entityDef.spawnFunc) {
                    entityDef.spawnFunc();
                }
            }
        }

        //make the animated stage
        let newStage = document.querySelector('#grid-ref').cloneNode(true)
        newStage.id = "realgrid"
        newStage.classList.remove('reference')
        newStage.classList.add('grid')
        document.querySelector('.grid-animator').insertAdjacentElement('beforeend', newStage)
        document.querySelector('.grid-animator').setAttribute('activeStage', targetStage)
        change('stageroom', targetStage)

        env.stage.name = targetStage
        env.stage.current = env.stages[targetStage]
        env.stage.enemyPause = false
        env.stage.virtualGrid = document.querySelector('#grid-ref').querySelectorAll('.gridpiece')
        env.stage.stageW = stage.width
        env.stage.stageH = env.stage.virtualGrid.length / env.stage.stageW
        
        step()
        
        setTimeout(()=>{
            if(env.stages[targetStage].locale) {
                content.setAttribute('locale', `${env.stages[targetStage].locale}`);
                newStage.setAttribute('locale', `${env.stages[targetStage].locale}`);
            } else {
                content.removeAttribute('locale');
            }

            removeDeadStageEnemies()

            if(env.stages[targetStage].exec) {
                env.stages[targetStage].exec();
            }
            
            //specific entry facing angles/directions if there are any
            let angles = {
                'up': 180,
                'right': 270,
                'down': 0,
                'left': 90,
            }
        
            //move the player to the spot, otherwise just spawn in the stage with no player (if no 'p' tile)
            if(spot !== false) {
                gridMoveTo(body.querySelector('#grid-ref #creature').parentElement, body.querySelectorAll(`#grid-ref .gridpiece`)[spot])
            }

            //either has the player face the specified direction, OR the default spawning direction
            let shouldFace = direction
            if(shouldFace == "false" || !shouldFace) shouldFace = stage.enterDirection
            if(shouldFace) {
                env.stage.lastMoved = shouldFace
                document.querySelector('.grid-plane').setAttribute('lastmoved', shouldFace); 
                document.querySelector('.grid-animator').style.setProperty('--camrotation', angles[shouldFace])
            }
            
            step()
            body.classList.add('stage-active')
        }, 200);

        setTimeout(()=>{
            flash(false)
            body.classList.remove('stage-transition')
        }, 400)
    }, 400); 
}


//turns left or right
function playerTurn(clockwise = true) {
    var turn
    var currentIndex = env.stage.moveDir.indexOf(env.stage.lastMoved)
    
    switch(clockwise) {
        case true:
            turn = -1
        break

        case false:
            turn = 1
        break
    }

    //handles any wrapping
    var newIndex = currentIndex + turn
    if(newIndex < 0) {
        newIndex = 3
    } else if(newIndex >= 4) {
        newIndex = 0
    }   

    //update relevant variables
    env.stage.lastMoved = env.stage.moveDir[newIndex]
    document.querySelector('.grid-plane').setAttribute('lastmoved', env.stage.lastMoved)

    //rotate camera appropriately (offset handled in css by the lastmoved attr on html)
    let currentRotation = parseInt(document.querySelector('.grid-animator').style.getPropertyValue('--camrotation'))
    let newRotation = currentRotation + (90 * turn)
    
    document.querySelector('.grid-animator').style.setProperty('--camrotation', `${newRotation}`)
}

//set up the movement controls
var stageKeypress = (e) => { stepKey(e.key) }
function stepKey(key) {
    //we don't let any steps happen under certain circumstances
    if(env.stage.justStepped || 
        body.classList.contains('stage-transition') || 
        body.classList.contains('cull-stage') || 
        body.classList.contains('in-dialogue') || 
        body.classList.contains('in-combat') ||
        body.classList.contains('in-melee') ||
        document.documentElement.classList.contains('cutscene') || 
        document.querySelector('#grid-ref') == null) {
        return
    } else {
        env.stage.justStepped = true
        setTimeout(() => {env.stage.justStepped = false}, 100)

        //we reset the angleReset if it's going, then set a new angleReset timer
        //this is done to prevent the 'winding' bug (i.e. sickening spinning transition from 9 billion degrees to 0deg)
        if(env.stage.angleReset) clearTimeout(env.stage.angleReset)
        env.stage.angleReset = setTimeout(() => {
            let gridAnim = document.querySelector(".grid-animator")
            let noTransitions = document.querySelectorAll('.grid-animator, #realgrid .truecreature')
            
            noTransitions.forEach(el=>el.classList.add('no-transition'))
            env.stage.justStepped = true

            setTimeout(()=>{

                switch(env.stage.lastMoved) {
                    case "down": gridAnim.style.setProperty("--camrotation", 0); break
                    case "left": gridAnim.style.setProperty("--camrotation", 90); break
                    case "right": gridAnim.style.setProperty("--camrotation", -90); break
                    case "up": gridAnim.style.setProperty("--camrotation", 180); break
                }

                setTimeout(()=>{
                    noTransitions.forEach(el=>el.classList.remove('no-transition'))
                    env.stage.justStepped = false
                }, 75)
            }, 75)
        }, 1000)
    }

    //close any open menus
    if(body.classList.contains('in-menu') && key != "z") exitMenu(false)

    let homeBox = stageCoordinatesFromId('creature')
    let homePlate = elementAtStageCoordinates(homeBox.x, homeBox.y)
    var targetSquare
    var moving = false

    switch(key.toLowerCase()) {
        //movement
        case "w": //move in direction you're looking
            moving = "forward"
        break;

        case "a": // turn left
            playerTurn(false)
        break;

        case "s": //away from where you're looking
            moving = "back"
        break;

        case "d": //turn right
            playerTurn()
        break;	

        case "e":
            content.classList.toggle('swapcam')
        break;

        case "q":
            switch(body.getAttribute('quality')) {
                case "high":
                    setQualityPreference('regular')
                break

                case "regular":
                    setQualityPreference('low')
                break

                case "low":
                    setQualityPreference('high')
                break
            }
        break;

        case "z":
            if(page.partyMenuEnabled) togglePartyMenu()
        break;
    }

    if(moving) {
        var modifier = 1
        if(moving == "back") modifier = -1

        switch(env.stage.lastMoved) {
            case "up":
                targetSquare = elementAtStageCoordinates(homeBox.x, homeBox.y + modifier)
            break
            case "right":
                targetSquare = elementAtStageCoordinates(homeBox.x + modifier, homeBox.y)
            break
            case "down":
                targetSquare = elementAtStageCoordinates(homeBox.x, homeBox.y - modifier)
            break
            case "left":
                targetSquare = elementAtStageCoordinates(homeBox.x - modifier, homeBox.y)             
            break
        }
    }
    
    if(targetSquare != undefined) {
        gridMoveTo(homePlate, targetSquare);
        step()
        if(!env.stage.enemyPause) enemyStep()
    }
}

/* NEW EP3 GRID LOCATION FUNCTIONS - VIRTUAL */
function stageCoordinatesFromIndex(index) {
    let x = index % env.stage.stageW
    let y = Math.floor(index / env.stage.stageW)
    return { x, y }
}

function stageCoordinatesFromId(id) {
    const index = stageIndexFromEntId(id);


    if (index === -1) {
        return null; 
    }
    
    return stageCoordinatesFromIndex(index)
}

function stageIndexFromEntId(id) {
    for (let i = 0; i < env.stage.virtualGrid.length; i++) {
        if(env.stage.virtualGrid[i].lastElementChild) if (env.stage.virtualGrid[i].lastElementChild.id === id) {
            return i;
        }
    }
    return -1;
}

function stageIndexFromStageCoordinates(x, y) {
    if(y < 0 || x < 0 || x >= env.stage.stageW || y >= env.stage.stageH) return -1
    return (y * env.stage.stageW) + x
}

function elementAtStageCoordinates(x, y) {
    let index = stageIndexFromStageCoordinates(x, y);
    if (
        index < 0 || 
        index >= env.stage.virtualGrid.length
    ) {
        return null; // Coordinates are outside the grid range
    }

    console.log(x, y)

    return env.stage.virtualGrid[index];
}
/**********************************************/

//gets the index of the element in its parent
function getIndex(elm) { return [...elm.parentNode.children].indexOf(elm) }

//gets the X and Y of an entity
function getXYDist(pos1, pos2) {
    let dx = pos2.x - pos1.x;
    let dy = pos2.y - pos1.y;

    return Math.sqrt(dx * dx + dy * dy);
}

//unlock any locked entities if they either have no lock condition, or should be unlocked
function checkLocks() {
    document.querySelectorAll('.locked').forEach(e=>{
        if(e.getAttribute('lockflag') == "permalocked") return
        if(!e.hasAttribute('lockflag') || e.getAttribute('lockflag') == "" || getShowValidity(e.getAttribute('lockflag'))) {e.classList.remove('locked')}
    })
}

//moves the game world forward one step
function step() {
    checkLocks()

    //move the creature, only if it's a different spot
    let realParent = document.querySelector('#realgrid #creature').parentElement
    let refParent = document.querySelector('#grid-ref #creature').parentElement
    if(getIndex(realParent) != getIndex(refParent)) { 
        gridMoveTo(realParent, document.querySelectorAll(`#realgrid .gridpiece`)[getIndex(refParent)]);	

        //executes any onStep
        if(typeof env.stage.current.onStep == "function") env.stage.current.onStep()
        
        //executes any function the entity has within its room or default object
        let entSlug = refParent.getAttribute('slug')
        if(entSlug && env.stage.current.entities) {
            let defaultEnt = env.stageEntities[entSlug];
            let customEnt = env.stage.current.entities[entSlug];
            if(customEnt)
                if(customEnt.exec) {customEnt.exec()}
            else if (defaultEnt) {
                if(defaultEnt.exec) {defaultEnt.exec()}
            }
        }
    }

    //this sets up CSS camera values
    let creatureXY = stageCoordinatesFromId('creature');

    let gridPlane = document.querySelector('.grid-plane')
    gridPlane.style.setProperty('--stage-steps-x', creatureXY.x)
    gridPlane.style.setProperty('--stage-steps-y', creatureXY.y)
    gridPlane.style.setProperty('--stage-width', env.stage.stageW)
    gridPlane.style.setProperty('--stage-height', env.stage.stageH)
    gridPlane.setAttribute('lastmoved', env.stage.lastMoved)

    env.stage.creatureLoc = creatureXY
}

function gridMoveTo(origin, target, mirror = undefined, mirrorGridPiece = '#realgrid .gridpiece') {
    if(!target) throw 'nonexistent target'

    let targetStyles = getComputedStyle(target)
    if(
        targetStyles.pointerEvents != "none" &&
        !(target.classList.contains('blocks')) && 
        (target.classList.contains('gridpiece') || target.classList.contains('fp-gridpiece')) && 
        target.innerHTML == "" && origin.innerHTML != ""
    ) {
        target.innerHTML = origin.innerHTML
        origin.innerHTML = ""

        if(mirror != undefined) {
            let originI = getIndex(origin);
            let targetI = getIndex(target);
            
            if(originI != targetI) {
                gridMoveTo(mirror, document.querySelectorAll(`${mirrorGridPiece}`)[targetI])
            }
        }

        var targetContents = target.children;
        for (var i = 0; i < targetContents.length; i++) {
            targetContents[i].style.transform = ""
        }

        return true;

    } else if(target.classList.contains('teleport')) {
        let entSlug = target.getAttribute('slug')
            //if it's locked and it has a lockexec, do it
            if(target.classList.contains('locked') && target.getAttribute("lockexec").length) {
                if(entSlug && env.stages[body.id].entities) {
                    let defaultEnt = env.stageEntities[entSlug];
                    let customEnt = env.stages[body.id].entities[entSlug];
                    if(customEnt)
                        if(customEnt.lockExec) {customEnt.lockExec()}
                    else if (defaultEnt) {
                        if(defaultEnt.lockExec) {defaultEnt.lockExec()}
                    }
                }
            }
            //otherwise if it isn't locked, do any exec, then teleport to the stage specified
            else if(!target.classList.contains('locked')) {
                
                if(entSlug && env.stages[body.id].entities) {
                    let defaultEnt = env.stageEntities[entSlug];
                    let customEnt = env.stages[body.id].entities[entSlug];
                    if(customEnt)
                        if(customEnt.exec) {customEnt.exec()}
                    else if (defaultEnt) {
                        if(defaultEnt.exec) {defaultEnt.exec()}
                    }
                }

                changeStage(target.getAttribute('teleport-target'), 
                    target.getAttribute('spot') == "false" ? false : target.getAttribute('spot'),
                    target.getAttribute('shouldFace') == "false" ? false : target.getAttribute('shouldFace'), 
                )
            }
        return true;
        
    } else if(origin.children[0].classList.contains('player')) {
        console.log(`player gridMoveTo rejected - (blocks: ${target.classList.contains('blocks')}), (HTML: ${target.innerHTML})`)
    } else {
        console.log(`gridMoveTo rejected - (blocks: ${target.classList.contains('blocks')}), (HTML: ${target.innerHTML})`)
    }
    
    return false;
}

function updateStageCreature() {
    try{ 
        let creature = document.querySelector('#realgrid .truecreature')
        creature.innerHTML = env.stage.current.creature()
    } catch(e) {console.log('stage creature update failed', e)}
}

function generateAttributes (piece) {
    if(typeof piece.attributes != "object") return ""
    let finalAttributes = ""

    piece.attributes.forEach(attribute=>{
        finalAttributes += `${attribute[0]}="${attribute[1]}" `
    })

    console.log(finalAttributes)
    return finalAttributes
}

function stageCleanup() {
    document.querySelectorAll('#gridref').forEach(e => e.remove())
    try{ document.removeEventListener('keypress', stageKeypress) } catch(e) { /* never defined */ }
}

/* CAMERA CONTROLS 
/*  These are used mostly by dialogues to control how and when the player is allowed to swap their camera position
*   pauseSwapCam will remove swapCam and store it if they had it
*   forceSwapCam will do the opposite
*  both of these functions can be toggled
*  there's a way to do it with one function but this makes EXECs more readable
*/
function pauseSwapCam(pausing = true) {
    if(pausing) {
        if(content.classList.contains('swapcam')) env.storingSwap = true
        content.classList.remove('swapcam')
    } else if(env.storingSwap) { 
        content.classList.add('swapcam')
        env.storingSwap = false
    }
}

function forceSwapCam(forcing = true) {
    if(forcing) {
        if(!content.classList.contains('swapcam')) env.forcingSwap = true
        content.classList.add('swapcam')
    } else if(env.forcingSwap) { 
        content.classList.remove('swapcam')
        env.forcingSwap = false
    }
}

/* shortcut for setting an attribute on grid-plane watched by CSS */
function specialCam(angle) {
    content.querySelector('.grid-plane').setAttribute('specialcam', angle ? angle : "")
}

// ENEMY ADDITIONS
// enemy step should do the following:
    // for each enemy on the grid, unless it has 'nomove', move it one step closer to the player
    // if the enemy is directly next to the player
function enemyStep() {
    if(check("TEMP!!noevil")) return
    if(!env.currentDialogue.active && !document.querySelector('#combat')){
        var hitPlayer = false
        document.querySelectorAll("#grid-ref .evil").forEach(el => {
            if(el.classList.contains('dead', 'nomove')) return

            //prep a move towards player, executed after hit checks
            //check if this is above, to the left of, to the right of, or below player
            //randomly choose one of two (move x or move y) as flagged above
            let parentPos = stageCoordinatesFromId(el.id)
            let playerPos = stageCoordinatesFromId('creature')

            var relativeToPlayer = [];
            relativeToPlayer.push(parentPos.y < playerPos.y ? "below" : "above")
            relativeToPlayer.push(parentPos.x < playerPos.x ? "right" : "left")
            let move = relativeToPlayer[Math.floor(Math.random() * relativeToPlayer.length)];
            
            //check the sides to see if they're touching the player
            let checkThesePoints = [
                [parentPos.x, parentPos.y + 1],
                [parentPos.x, parentPos.y - 1],
                [parentPos.x - 1, parentPos.y],
                [parentPos.x + 1, parentPos.y]
            ]

            //marks checked spots for querying
            try {
                checkThesePoints.forEach(point => {
                    //prevent out of bounds checking to avoid wacky side effects
                    if(point[0] < 0 || point[1] < 0 || point[0] > (env.stage.stageW - 1) || point[1] > (env.stage.stageH - 1)) return

                    let spot = elementAtStageCoordinates(point[0], point[1])
                    if(!spot.classList.contains('checked')) { 
                        spot.classList.add('checked')
                        spot.setAttribute('challenger', `#${el.id}`)
                    }
                });
            } catch(e) {
                console.log('challenge check failed', e)
            }

            document.querySelectorAll('.checked').forEach(tile=>{
                if(!hitPlayer) {
                    let hitTarget = tile.querySelector('#creature') || tile.id == "creature"
                    let attacker = document.querySelector(tile.getAttribute('challenger'))
                    
                    if(hitTarget) {
                        hitPlayer = true
                        console.log('contact with player', tile)
                        //start combat
                        try{
                            startDialogue(attacker.getAttribute('dialogue'), {
                                originEntityID: attacker.id
                            });
                        } catch(e) { /* attacker despawned */ }
                    }

                    tile.classList.remove('checked')
                    tile.setAttribute('challenger', '')
                }
            })
            
            //if the player was hit, don't move
            if(hitPlayer) { return }

            //otherwise, move closer to the player
            if(getXYDist(parentPos, playerPos) <= 1 ) return
            let elMirror = document.querySelector(`#realgrid #${el.id}`).parentElement
            switch(move) {
                case "above":
                    gridMoveTo(el.parentElement, elementAtStageCoordinates(parentPos.x, parentPos.y - 1), elMirror)
                break;

                case "right":
                    gridMoveTo(el.parentElement, elementAtStageCoordinates(parentPos.x + 1, parentPos.y), elMirror)
                break;

                case "left":
                    gridMoveTo(el.parentElement, elementAtStageCoordinates(parentPos.x - 1, parentPos.y), elMirror)
                break;

                case "below":
                    gridMoveTo(el.parentElement, elementAtStageCoordinates(parentPos.x, parentPos.y + 1), elMirror)
                break;
            }
        })
    }
}

//'kills' the target enemy on the stage - behavior may change over time
function killStageEnemy(query) {
    if(query) document.querySelectorAll(`#grid-ref ${query}, .grid-plane ${query}`).forEach(el=>{
        el.parentElement.innerHTML = ""
    })
}

//runs through the page's deadGuys if it has any, removing permadead enemies
function removeDeadStageEnemies() {
    var deadGuys
    try { deadGuys = page.flags.deadGuys[env.stage.name] } catch (e) {/* dead guys not defined yet */}
    if(!deadGuys) return

    deadGuys.forEach(spot=>{
        document.querySelectorAll(`.gridpiece:nth-child(${spot})`).forEach(el=>{
            el.innerHTML = ""
        })
    })
}

function isStageClear(checkForSafe = true) {
    if(checkForSafe) return !document.querySelectorAll('#grid-ref .evil').length
    if(!checkForSafe) return document.querySelectorAll('#grid-ref .evil').length
}