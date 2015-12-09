
/*
Affinitomics Dungeon API Javascript Example 
Copyright (C) 2015 Prefrent
*/

/*
Version: 0.8
Author: Prefrent
Author URI: http://prefrent.com
*/

// +----------------------------------------------------------------------+
// | This program is free software; you can redistribute it and/or modify |
// | it under the terms of the GNU General Public License, version 2, as  |
// | published by the Free Software Foundation.                           |
// |                                                                      |
// | This program is distributed in the hope that it will be useful,      |
// | but WITHOUT ANY WARRANTY; without even the implied warranty of       |
// | MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the        |
// | GNU General Public License for more details.                         |
// |                                                                      |
// | You should have received a copy of the GNU General Public License    |
// | along with this program; if not, write to the Free Software          |
// | Foundation, Inc., 51 Franklin St, Fifth Floor, Boston,               |
// | MA 02110-1301 USA                                                    |
// +----------------------------------------------------------------------+


var g_game_domain = 'api_dungeon';			//the domain name applied to this api game example (this can be anything)	
var g_curDungeon = 0;
var g_gameManager = null;
var g_waitingObjects = 0;					//use of this var is to indicate if there are any objects that are waiting to be updated
var g_mazeHeight = 0;
var g_mazeWidth = 0;
var g_mazeArray = [];
var g_playerObject = 0;


var GameManager = function()
{
	this.current_dungeon = null;
	this.current_player = null;
	this.gameloop_timer = null;
	this.game_state = 'paused';		//by default, the game is 0 (paused) until it is started 

	//call this function only after the player object has been created 
	this.CreateDungeon = function(width, height, levelNumber)
	{
		this.current_dungeon = new Dungeon(width, height, 20, levelNumber);

		this.current_dungeon.AddPlayerObject(this.current_player);

		this.current_dungeon.SyncDungeon();

	};

	this.CreatePlayer = function()
	{
		this.current_player = new Player();

		this.current_player.addDraw("gold_chest", 1);
		this.current_player.addDraw("key", 1);
		this.current_player.addDraw("exits", 1);
		this.current_player.addDraw("goblins", 1);
		this.current_player.addDistance("player", 1);
		this.current_player.addDistance("death", 1);
		this.current_player.addDescriptor("player");
	};


	this.LayoutHTML = function()
	{
		jQuery('#dungeon_game').append('<div id="the_gui"> </div><div id="the_room_container"> <img id="the_room" src="assets/room.png" ><img id="hallway_west" src="assets/exit_hallway.png" ><img id="hallway_north" src="assets/exit_hallway.png" ><img id="hallway_east" src="assets/exit_hallway.png" ><img id="hallway_south" src="assets/exit_hallway.png" ><img id="the_key" src="assets/key.png" ><img id="the_player" src="assets/player.png" ><img id="room_exit" src="assets/exit_stairs.png" ><img id="gold_chest" src="assets/gold_chest.png" ><div id="all_goblins"><img class="goblin_class" id="goblin_1" src="assets/goblin.png" ></div></div>');
	}


	//setup the necessary html 
	this.LayoutHTML();

	//setup the player character 
	this.CreatePlayer();

	//setup the initial dungeon 
	this.CreateDungeon(5, 5, 1);
};


GameManager.prototype.hideRoomObjects = function()
{
	jQuery('#hallway_west').hide();
	jQuery('#hallway_north').hide();
	jQuery('#hallway_east').hide();
	jQuery('#hallway_south').hide();

	jQuery('#the_key').hide();
	jQuery('#room_exit').hide();
	jQuery('#gold_chest').hide();
	jQuery('#goblin_1').hide();
};


GameManager.prototype.drawRoom = function(room)
{
	goblinCount = 0;
	for (var objectKey in room.objectsInRoom) 
	{
		if (room.objectsInRoom.hasOwnProperty(objectKey)) 
		{
			curObj = room.objectsInRoom[objectKey];

			//determine the type of object
			if (curObj instanceof Goblin)
			{
				jQuery('#goblin_1').show();
				goblinCount++;
			}
			else if (curObj instanceof GoldObject)
			{
				jQuery('#gold_chest').show();
			}
			else if (curObj instanceof DungeonExit)
			{
				jQuery('#room_exit').show();
			}
			else if (curObj instanceof KeyItem)
			{
				jQuery('#the_key').show();
			}

		}
	}

	//determine the available exits for the room
	if (room.xLoc > 0)
	{	//show the west hallway
		jQuery('#hallway_west').show();
	}

	if (room.xLoc < g_mazeWidth - 1)
	{	//show the east hallway
		jQuery('#hallway_east').show();
	}

	if (room.yLoc > 0)
	{	//show the north hallway
		jQuery('#hallway_north').show();
	}

	if (room.yLoc < g_mazeHeight - 1)
	{	//show the south hallway
		jQuery('#hallway_south').show();
	}

};

//advance to the next dungeon level
GameManager.prototype.AdvanceLevel = function()
{
	//enter a loading state while we create the new dungeon
	this.game_state = 'loading';

	//create a new dungeon at the next level 
	this.CreateDungeon(5, 5, this.current_dungeon.level + 1);
	//TODO: while we wait for the new dungeon to finish syncing 

	this.game_state = 'running';
};


GameManager.prototype.StartGame = function()
{
	this.game_state = 'running';
	this.gameloop_timer = setInterval(this.GameLoop, 1000);
};


GameManager.prototype.PauseGame = function()
{
	this.game_state = 'paused';
};


GameManager.prototype.ResumeGame = function()
{
	if (this.game_state == 'paused')
	{
		this.game_state = 'running';
	}
};

GameManager.prototype.GameLoop = function()
{
	if (g_gameManager.game_state == 'paused')
	{	//the game has been paused... show a pause screen while waiting to be unpaused 
		//TODO: add a pause screen
	}
	else if (g_gameManager.game_state == 'running')
	{
	    g_gameManager.current_dungeon.update();

	    //describe/draw the dungeon 
		//initially, all the room objects will be hidden
		g_gameManager.hideRoomObjects();
		curRoom = g_gameManager.current_dungeon.GetPlayerRoom();
		g_gameManager.drawRoom(curRoom);
	}
	else if (g_gameManager.game_state == 'loading')
	{	
		//TODO: show a loading screen 
	}

};



var Dungeon = function(width, height, goblinNumber, levelNumber)
{
	this.obj_name = '';
	this.guid = 'xxxxxxxx-xxxx-2xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) 
		{
    		var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
    		return v.toString(16);
		});;

	this.dungeonObjects = {};			//all of the objects that are a part of this dungeon

	this.dungeonWidth = width;
	this.dungeonHeight = height;
	g_mazeHeight = height;
	g_mazeWidth = width;
	this.goblinNumber = goblinNumber;
	this.playerObject = 0;
	this.level = levelNumber;

	g_curDungeon = this;

	this.CreateDungeon = function(width, height)
	{
		//setup the array to hold the maze 
		g_mazeArray = new Array(width);
		for (i = 0; i < width; i++)
		{
			g_mazeArray[i] = new Array(height);
		}


		for (x = 0; x < width; x++)
		{
			for (y = 0; y < height; y++)
			{	//create the rooms that will fill the array 
				tempRoom = new DungeonRoom();
				tempRoom.xLoc = x;
				tempRoom.yLoc = y;
				g_mazeArray[x][y] = tempRoom;

			}
		}
	};

	this.AddObjectToRandomRoom = function(dungeonObject)
	{
		xLoc = Math.floor((Math.random() * width));
		yLoc = Math.floor((Math.random() * height));

		roomAtLoc = g_mazeArray[xLoc][yLoc];
		if (roomAtLoc)
		{
			roomAtLoc.addObjectToRoom(dungeonObject);
			dungeonObject.xLoc = xLoc;
			dungeonObject.yLoc = yLoc;
		}

	}

	this.SetupGoblins = function(goblinNumber) 
	{
		for (i = 0; i < goblinNumber; i++)
		{
			var tempGoblin = new Goblin();
			this.dungeonObjects[tempGoblin.guid] = tempGoblin;

			//add the goblin to a room
			this.AddObjectToRandomRoom(tempGoblin);
		}
	};

	this.SetupExit = function()
	{	//create an exit in the maze for the player to find
		var tempExit = new DungeonExit();
		this.dungeonObjects[tempExit.guid] = tempExit;

		this.AddObjectToRandomRoom(tempExit);
	}

	//places gold randomnly in the dungeon in x places given by goldLocations
	this.SetupGold = function(goldLocations)
	{
		for (i = 0; i < goldLocations; i++)
		{
			var tempGold = new GoldObject();
			this.dungeonObjects[tempGold.guid] = tempGold;

			this.AddObjectToRandomRoom(tempGold);
		}
	}


	this.SetupKey = function()
	{
		var tempKey = new KeyItem();
		this.dungeonObjects[tempKey.guid] = tempKey;

		this.AddObjectToRandomRoom(tempKey);

	}

	//create the dungeon layout
	this.CreateDungeon(width, height);

	//create the goblins that will be in the dungeon
	this.SetupGoblins(goblinNumber);

	//setup an exit in the dungeon
	this.SetupExit();

	//setup gold for the player to find
	this.SetupGold(10);

	//setup and add a key to the room
	this.SetupKey();


};

//call this function in the gameloop to update the state of the game
Dungeon.prototype.update = function()
{
	if (g_waitingObjects > 0)
	{	//we will not perform an update until all of the objects are ready
		return;
	}

	//perform actions
	for (var objectKey in this.dungeonObjects) 
	{
		//first move the objects (as necessary)
  		if (this.dungeonObjects.hasOwnProperty(objectKey)) 
  		{
 			objToUpdate = this.dungeonObjects[objectKey];
 			objToUpdate.move(this.guid);
 		}
 	}
	for (var objectKey in this.dungeonObjects) 
	{
		//then have the objects update
  		if (this.dungeonObjects.hasOwnProperty(objectKey)) 
  		{
 			objToUpdate = this.dungeonObjects[objectKey];
 			objToUpdate.update(this.guid);
 		}
 	}


};

Dungeon.prototype.AddDungeonObject = function(dungeonObject)
{
	this.dungeonObjects[dungeonObject.guid] = dungeonObject;

	//place the dungeon object in a room in the dungeon
	xLoc = Math.floor((Math.random() * g_mazeWidth));
	yLoc = Math.floor((Math.random() * g_mazeHeight));

	roomAtLoc = g_mazeArray[xLoc][yLoc];
	if (roomAtLoc)
	{
		roomAtLoc.addObjectToRoom(dungeonObject);
		dungeonObject.xLoc = xLoc;
		dungeonObject.yLoc = yLoc;
	}

};

Dungeon.prototype.AddPlayerObject = function(playerObject)
{
	this.playerObject = playerObject;
	this.AddDungeonObject(playerObject);
}

Dungeon.prototype.RemoveDungeonObject = function(dungeonObject)
{
	xLoc = dungeonObject.xLoc;
	yLoc = dungeonObject.yLoc;
	tempRoom = g_mazeArray[xLoc][yLoc];
	if (tempRoom)
	{
		tempRoom.removeObjectFromRoom(dungeonObject);
	}

	delete this.dungeonObjects[dungeonObject.guid];

	removeArchetype(dungeonObject.guid,			//id of the object (archetype) to remove 
					//this.guid, 				//domain 
					g_game_domain,			//domain
					genericCompletionHandler,	//completion handler
					this);						//completion data
}

Dungeon.prototype.GetPlayerRoom = function()
{
	tempRoom = g_mazeArray[this.playerObject.xLoc][this.playerObject.yLoc];
	return tempRoom;
}

//returns the object type of the given guid
Dungeon.prototype.GetObjectType = function(object_id)
{	
	objType = '';
	tempObject = this.dungeonObjects[object_id];
	if (tempObject)
	{
		objType = tempObject.obj_type;
	}

	return objType;
}

//for now, the dungeon handles attacks of objects on other objects
Dungeon.prototype.AttackObject = function(attacker_id, attackee_id)
{
	attacker = this.dungeonObjects[attacker_id];
	attackee = this.dungeonObjects[attackee_id];

	//at this moment attacks are kept very simple and do just 1 damager by default
	attackee.takeDamage(1);
}

Dungeon.prototype.PickupObject = function(character_id, object_id)
{
	objectToPickUp = this.dungeonObjects[object_id];
	character = this.dungeonObjects[character_id];

	if (objectToPickUp.item_type == 'gold')
	{	//give gold value to the character and remove gold item from the dungeon
		goldValue = objectToPickUp.gold_value;
		character.addGold(goldValue);

		objectToPickUp.pickedUp();

	}
	else if (objectToPickUp.item_type == 'key')
	{
		character.addItemToInventory(objectToPickUp);
	
		objectToPickUp.pickedUp();
	}

}

Dungeon.prototype.SyncDungeon = function()
{	//this will go through the steps to sync all of the objects in the dungeon, 
	//  including the dungeon itself, with the aimojo server 
	for (var objectKey in this.dungeonObjects) 
	{
  		if (this.dungeonObjects.hasOwnProperty(objectKey)) 
  		{
	   		objToSync = this.dungeonObjects[objectKey];

    		objToSync.SyncObject(this.guid);
    		console.log("synced object id: " + objToSync.guid);
    	}
  	}
};


function genericCompletionHandler(responseObject, callingObject, callType)
{
	if (responseObject['status'] == 'success')
    {

    }

}


function syncCompletionHandler(responseObject, syncedObject, callType)
{
	syncedObject.syncStatus = 'clean';
	g_waitingObjects--;

};


//function is to be called on return from rankAgainstArchetypes after receiving results from server
function rankObjectsCompletionHandler(responseObject, callingObject, callType)
{
	callingObject.syncStatus = 'clean';
	
	//TODO: determine what to do with the returned responses
	callingObject.rankCompleted(responseObject);
	g_waitingObjects--;
};


var DungeonObject = function()
{
	this.dungeon = null;
	this.draws = [];
	this.distances = [];
	this.descriptors = '';
	this.obj_name = 'base object';
	this.obj_type = 'dungeon_object';
	this.syncStatus = 'dirty';
	this.updateNumber = 0;

	this.xLoc = 0;
	this.yLoc = 0;

	this.guid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) 
		{
    		var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
    		return v.toString(16);
		});;
};

DungeonObject.prototype.SyncObject = function(dungeonID)
{
	//TODO: may want to differentiate by callType
	g_waitingObjects++;
	this.syncStatus = 'dirty';				//set the object to dirty before the sync
	syncArchetype(this.guid, 				//archetype id
					g_game_domain,			//domain
					this.descriptors, 		//descriptors
					this.draws, 			//draws
					this.distances, 		//distances
					this.obj_name, 			//title
					'',			 			//categories
					dungeonID, 				//sets  -- currently using the dungeon id as the set that this object will be a part of
					'', 					//status -- currently unnecessary for this example
					syncCompletionHandler,	//dataHandler callback function
					this);					//completionData

};


DungeonObject.prototype.addDraw = function(newDraw, magnitude)
  	{
  		this.draws.push({term: newDraw, magnitude: magnitude});
  	};

DungeonObject.prototype.addDistance = function(newDistance, magnitude)
  	{
  		this.distances.push({term: newDistance, magnitude: magnitude});
  	};
  	
DungeonObject.prototype.addDescriptor = function(newDescriptor)
  	{
 		if (this.descriptors.length < 1)
  		{
  			this.descriptors = newDescriptor;
  		}
  		else
  		{
  			this.descriptors = this.descriptors + ',' + newDescriptor;
  		}
  	};

// the move function that should be called in the game loop before update
DungeonObject.prototype.move = function(dungeonID)
	{
		//the default object does not do anything during the move phase
	};
  		

// the update function that should be called in the game loop
DungeonObject.prototype.update = function(dungeonID)
	{
		this.updateNumber += 1;
	};
  		

DungeonObject.prototype.rankCompleted = function(resposneData)
	{

	};

// Character -  subclass of DungeonObject
var Character = function() 
{
  	DungeonObject.call(this); // call super constructor.
  	this.obj_name = "base character";
	this.obj_type = 'character';

	this.inventory = {};			//all of the objects that this character is carrying


	this.health = 5;				//base characters start with a health of 5
	this.maxHealth = 5;				//the default max health of a character is 5

	this.gold = 0;					//default gold value for a new character 
};

// Character subclass extends superclass (DungeonObject)
Character.prototype = Object.create(DungeonObject.prototype);
Character.prototype.constructor = Character;

//cause the character to die
Character.prototype.die = function()
{	//when an object dies we want to remove it from the room and from the dungeon
	//optionally, we may want to put a 'dead' version of the object in its place in the room and dungeon
	g_curDungeon.RemoveDungeonObject(this);
}

//the character takes a certain amount of damage
Character.prototype.takeDamage = function(damageAmt)
{
	this.health -= damageAmt;
	if (this.health <= 0)
	{	//this object has hit 0 health (or less!) and has died! 
		this.health = 0;		//ensure that health has not gone below 0
		this.die();				//kill off this character
	}
}

//the character gains a certain amount of health
Character.prototype.addHealth = function(healthAmt)
{
	this.health += healthAmt;
	if (this.health > this.maxHealth)
	{	//ensure that the health level does not go above the max amount
		this.health = this.maxHealth
	}
}


//add gold to the character 
Character.prototype.addGold = function(goldAmt)
{
	this.gold += goldAmt;
}

//remove gold from the character
Character.prototype.removeGold = function(goldAmt)
{
	this.gold -= goldAmt;
}


// the update function that should be called in the game loop
Character.prototype.update = function(dungeonID)
	{

	};

// causes the character to lookAround the surroundings
Character.prototype.lookAround = function()
	{

	};

// add an item to the characters inventory
Character.prototype.addItemToInventory = function(itemToAdd)
	{		
		itemsOfType = this.inventory[itemToAdd.obj_type];
		if (itemsOfType)
		{	//already have items of this type, so just add it
			itemsOfType[itemToAdd.guid] = itemToAdd;
		}
		else
		{	// no items of this type yet exist
			tempArray = {};
			tempArray[itemToAdd.guid] = itemToAdd
			this.inventory[itemToAdd.obj_type] = tempArray;
		}
	};

// remove an item from the characters inventory
Character.prototype.removeItemFromInventory = function(itemToRemove)
	{		
		itemsOfType = this.inventory[itemToRemove.obj_type];
		if (itemsOfType)
		{	//already have items of this type, so just add it
			delete itemsOfType[itemToRemove.guid];
		}
	};

//Player - subclass of Character 
var Player = function()
{
	Character.call(this);
	this.obj_name = "the player";
	this.obj_type = 'player';

	this.action_type = 'move';
	this.action_object = 0;

	this.health = 10;				//default health value for a new player
	this.maxHealth = 10;			//default max health value for a new player 

};

Player.prototype = Object.create(Character.prototype);
Player.prototype.constructor = Player;


Player.prototype.rankCompleted = function(resposneData)
	{
		if (resposneData['status'] == 'success')
		{
			matches = resposneData['matches'];

			//get the object_id of the highest matching object
			highest_match_score = 0;
			highest_match_object = 0;

			matches.forEach(function(match) 
			{
    			score = match['score'];
    			if (score > highest_match_score)
    			{	
    				highest_match_score = score;
    				highest_match_object = match['archetype_id'];
    			}
			});

			this.action_type = 'move';			//the default action of the player will always be to move
			if (highest_match_score > 0)
			{	//we had a valid matching high scoring object!
				// now lets do something with it! (by first determining what type of object it is!)
				objType = g_curDungeon.GetObjectType(highest_match_object);
				if (objType.length > 0)
				{	//figure out what the player wants to do with this type of object
					if (objType == 'goblin')
					{	//attack the goblin!!
						this.action_type = 'attack_goblin';
						this.action_object = highest_match_object;
					}
					else if (objType == 'gold_chest')
					{	//get the gold!!
						this.action_type = 'get_gold';
						this.action_object = highest_match_object;
					}
					else if (objType == 'dungeon_exit')
					{	//head for the exit!! 
						//   but you cant head for the exit unless you have the key! 
						// so check for a dungeon key first 

						if (this.hasDungeonKey())
						{
							this.action_type = 'exit';
							this.action_object = highest_match_object;					
						}
					}
					else if (objType == 'dungeon_key')
					{
						this.action_type = 'get_key';
						this.action_object = highest_match_object;
					}
				}
			}
		}
	};


// the move function that should be called in the game loop before update
Player.prototype.move = function(dungeonID)
	{
		if (this.action_type == 'move')
		{
			//the default object does not do anything during the move phase
			while (1)
			{	//loop until a proper direction is picked 
				//pick a random direction to head in (this player isnt too bright)
				xChange = 0;
				yChange = 0;
				direction = Math.floor((Math.random() * 4));
				switch (direction)
				{
					case 0: //move west
					{
						xChange = -1;
						break;
					}
					case 1: //move north
					{
						yChange = -1;
						break;
					}
					case 2: //move east
					{
						xChange = 1;
						break;
					}
					case 3: //move south
					{
						yChange = 1;
						break;
					}
				}

				//ensure that the new coords would be valid
				if ((this.xLoc + xChange >= 0) & (this.xLoc + xChange < g_mazeWidth) & (this.yLoc + yChange >= 0) & (this.yLoc + yChange) < g_mazeHeight)
				{
					//remove the player from the current room
					oldRoom = g_mazeArray[this.xLoc][this.yLoc];
					if (oldRoom)
					{
						oldRoom.removeObjectFromRoom(this);
					}

					this.xLoc += xChange;
					this.yLoc += yChange;
					
					//add the player to the new room
					newRoom = g_mazeArray[this.xLoc][this.yLoc];
					if (newRoom)
					{
						newRoom.addObjectToRoom(this);
					}

					//describe the direction the player has moved in
					switch (direction)
					{
						case 0: //move west
						{
							console.log("the player has moved west")
							break;
						}
						case 1: //move north
						{
							console.log("the player has moved north")
							break;
						}
						case 2: //move east
						{
							console.log("the player has moved east")
							break;
						}
						case 3: //move south
						{
							console.log("the player has moved south")
							break;
						}
					}

					break;

				}
			}
		}
		else if (this.action_type == 'get_gold')
		{	//we now pick up a gold chest 
			g_curDungeon.PickupObject(this.guid, this.action_object);
		}
		else if (this.action_type == 'attack_goblin')
		{	//we now attack a goblin
			g_curDungeon.AttackObject(this.guid, this.action_object);
		}
		else if (this.action_type == 'get_key')
		{
			g_curDungeon.PickupObject(this.guid, this.action_object);			
		}
		else if (this.action_type == 'exit')
		{	//use the key to exit the dungeon and move on to the next level
			this.useDungeonKey();	
			g_gameManager.AdvanceLevel();			
		}
		this.lookAround();


		//set the default move action of the player back to 'move'
		this.action_type = 'move';
	};

// the update function that should be called in the game loop
Player.prototype.update = function(dungeonID)
	{
		object_ids = '';
		curRoom = g_mazeArray[this.xLoc][this.yLoc];
		if (curRoom)
		{
			console.log('the player is in ' + curRoom.obj_name + ' xloc: ' + this.xLoc + '  yLoc: ' + this.yLoc);
		
			//loook at the objects in the room
			for (var objectKey in curRoom.objectsInRoom) 
			{
				if (objectKey != this.guid)
				{
					if (object_ids.length < 1)
					{	
						object_ids = objectKey;
					}
					else
					{	
						object_ids = object_ids + ',' + objectKey;
					}
				}
			}
		}

		if (object_ids.length > 0)		//ensure that there are any objects to rank against
		{
		//compare the objects in the room to see if theres anything that the player cares about
			g_waitingObjects++;
			this.syncStatus = 'dirty';				//set the object to dirty before the sync
			rankAgainstArchetypes(this.guid, 		//archetype id
							g_game_domain,			//domain
							object_ids,				//rank_archetpye_ids
							10,						//matches_limit
							'', 					//category_filter -- currently unnecessary for this example
							rankObjectsCompletionHandler,	//dataHandler callback function
							this);					//completionData
		}
		

	};

// causes the player to lookAround the surroundings
Player.prototype.lookAround = function()
	{	//get the room that the player is in
		curRoom = g_mazeArray[this.xLoc][this.yLoc];
		if (curRoom)
		{
			console.log('the player is in ' + curRoom.obj_name + ' xloc: ' + this.xLoc + '  yLoc: ' + this.yLoc);
		
			//loook at the objects in the room
			for (var objectKey in curRoom.objectsInRoom) 
			{
  				if (curRoom.objectsInRoom.hasOwnProperty(objectKey)) 
  				{
  					curObj = curRoom.objectsInRoom[objectKey];
 					console.log('the player sees ' + curObj.obj_name);
				}
			}
		}		
	};


//returns a bool to indicate whether the player has a dungeon key or not
Player.prototype.hasDungeonKey = function()
	{
		itemsOfType = this.inventory['dungeon_key'];
		if (itemsOfType)
		{
			for (var firstKey in itemsOfType) 
			{
				return true;
			}
		}
		return false;
	};

//uses a dungeon key 
Player.prototype.useDungeonKey = function()
	{
		itemsOfType = this.inventory['dungeon_key'];
		if (itemsOfType)
		{
			for (var firstKey in itemsOfType) 
			{
				key = itemsOfType[firstKey];
				key.keyUsed();
				delete itemsOfType[firstKey];
				return true;
			}
		}
		return false;

	};

//NPC - subclass of character 
var NPC = function()
{
	Character.call(this);
	this.obj_name = "base NPC";
	this.obj_type = 'NPC';
};

NPC.prototype = Object.create(Character.prototype);
NPC.prototype.constructor = NPC;


//Goblin - subclass of NPC
var Goblin = function()
{
	NPC.call(this);
	this.obj_name = "a goblin";
	this.obj_type = 'goblin';

	this.addDescriptor("goblins");
	this.addDraw("player", 1);

};

Goblin.prototype = Object.create(NPC.prototype);
Goblin.prototype.constructor = Goblin;

//Room - subclass of DungeonObject
var DungeonRoom = function()
{
	DungeonObject.call(this);
	this.obj_name = "a room";
	this.obj_type = 'dungeon_room';

	this.objectsInRoom = {};
};

DungeonRoom.prototype = Object.create(DungeonObject.prototype);
DungeonRoom.prototype.constructor = DungeonRoom;

// adds a given object to the room heirarchy
DungeonRoom.prototype.addObjectToRoom = function(dungeonObject)
	{
		this.objectsInRoom[dungeonObject.guid] = dungeonObject;
	};

// removes a given object from the room heirarchy
DungeonRoom.prototype.removeObjectFromRoom = function(dungeonObject)
	{
		delete this.objectsInRoom[dungeonObject.guid];
	};


//the Exit Object 
var DungeonExit = function()
{
	DungeonObject.call(this)
	this.obj_name = "the exit";
	this.obj_type = 'dungeon_exit';

	this.addDescriptor("exits");
	this.addDraw("player", 1);

};

DungeonExit.prototype = Object.create(DungeonObject.prototype);
DungeonExit.prototype.constructor = DungeonExit;

var DungeonItem = function()
{
	DungeonObject.call(this);

	this.obj_name = "generic item";
	this.obj_type = "generic_item";
	this.item_type = "generic"

	this.addDescriptor("generic item");

	this.gold_value = 0;							//default value of 0


}

DungeonItem.prototype = Object.create(DungeonObject.prototype);
DungeonItem.prototype.constructor = DungeonItem;

//this function is to indicate that the item has been picked up by the given character_id
// the generic item does no
DungeonItem.prototype.pickedUp = function(character_id)
{
// the generic item does not use the character_id, but could be used by subclasses for various things 
//	g_curDungeon.RemoveDungeonObject(this);			//we dont necessarily want to remove the object from the dungeon entirely
	
	//remove the item from the room it is in
	room = g_mazeArray[this.xLoc][this.yLoc];
	if (oldRoom)
	{
		room.removeObjectFromRoom(this);
	}



}


var GoldObject = function()
{
	DungeonItem.call(this)

	this.obj_name = "gold chest";
	this.obj_type = 'gold_chest';
	this.item_type = "gold";

	this.gold_value = 500;

	this.addDescriptor("gold_chest");
	this.addDraw("player", 1);
};

GoldObject.prototype = Object.create(DungeonItem.prototype);
GoldObject.prototype.constructor = GoldObject;


var KeyItem = function()
{
	DungeonItem.call(this)

	this.obj_name = "dungeon key";
	this.obj_type = 'dungeon_key';
	this.item_type = "key";

	this.addDescriptor("dungeon_key");
	this.addDescriptor("key");
	this.addDraw("player", 1);

}

KeyItem.prototype = Object.create(DungeonItem.prototype);
KeyItem.prototype.constructor = KeyItem;


KeyItem.prototype.keyUsed = function()
{	//by default, a used key is destroyed from the dungeon 
	g_curDungeon.RemoveDungeonObject(this);
}


