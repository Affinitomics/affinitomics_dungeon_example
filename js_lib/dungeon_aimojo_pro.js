
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


var g_ctype = 'api_dungeon_js_ex';
var g_cversion = '0.8';

function getDomains(dataHandler, completionData)
{
  data = {  };

  callAffinitomics(data, dataHandler, completionData, 'RequestDomains');

}


function getArchetypes(dataHandler, completionData)
{
  data = {  };

  callAffinitomics(data, dataHandler, completionData, 'RequestArchetypes');

}


function getArchetypesByDomain(domain, dataHandler, completionData)
{
  data = {
          domain:           domain
        };

  callAffinitomics(data, dataHandler, completionData, 'RequestArchetypesByDomain');

}




function getRelatedArchetypes(archetype_id, domain, matches_limit, category_filter, dataHandler, completionData)
{
  data = {
          archetype_id:     archetype_id,
          domain:           domain,
          matches_limit:    matches_limit,
          category_filter:  category_filter
        };

  callAffinitomics(data, dataHandler, completionData, 'RequestRelatedArchetypes');

 }

//rank_archetype_ids is a comma separated list of ids to be ranked against the given archetype_id
function rankAgainstArchetypes(archetype_id, domain, rank_archetpye_ids, matches_limit, category_filter, dataHandler, completionData)
{
  data = {
          archetype_id:       archetype_id,
          domain:             domain,
          matches_limit:      matches_limit,
          category_filter:    category_filter,
          rank_archetpye_ids: rank_archetpye_ids,
        };

  callAffinitomics(data, dataHandler, completionData, 'RankAgainstArchetypes');

}


function getArchetypeInfo(archetype_id, domain, dataHandler, completionData)
{
  data = {
          domain:           domain,
          archetype_id:     archetype_id
        };

  callAffinitomics(data, dataHandler, completionData, 'RequestArchetypeInfo');
  
}


function removeArchetype(archetype_id, domain, dataHandler, completionData)
{
  data = {
          domain:           domain,
          archetype_id:     archetype_id
        };

  callAffinitomics(data, dataHandler, completionData, 'RemoveArchetype');

}


function addSetToDomain(set_id, domain, dataHandler, completionData)
{
  data = {
          domain:           domain,
          set_id:           set_id,
        };

  callAffinitomics(data, dataHandler, completionData, 'AddSetToDomain');

}


function addArchetypeToSet(archetype_id, set_id, domain, dataHandler, completionData)
{
  data = {
          domain:           domain,
          archetype_id:     archetype_id,
          set_id:           set_id,
        };

  callAffinitomics(data, dataHandler, completionData, 'AddArchetypeToSet');

}


function removeArchetypeFromSet(archetype_id, set_id, domain, dataHandler, completionData)
{
  data = {
          domain:           domain,
          archetype_id:     archetype_id,
          set_id:           set_id,
        };

  callAffinitomics(data, dataHandler, completionData, 'RemoveArchetypeFromSet');

}


function getArchetypesInSet(set_id, domain, dataHandler, completionData)
{
  data = {
          domain:           domain,
          set_id:           set_id,
        };

  callAffinitomics(data, dataHandler, completionData, 'GetArchetypesInSet');

}


function removeSetFromDomain(set_id, domain, dataHandler, completionData)
{
  data = {
          domain:           domain,
          set_id:           set_id,
        };

  callAffinitomics(data, dataHandler, completionData, 'RemoveSetFromDomain');
}


function relateArchetypeWithSet(archetype_id, set_id, domain, matches_limit, category_filter, dataHandler, completionData)
{
  data = {
          archetype_id:     archetype_id,
          domain:           domain,
          matches_limit:    matches_limit,
          category_filter:  category_filter,
          set_id:           set_id,
        };

  callAffinitomics(data, dataHandler, completionData, 'RelateArchetypeWithSet');
}


function syncArchetype(archetype_id, domain, descriptors, draws, distances, title, categories, sets, status, dataHandler, completionData)
{
  data = {
          archetype_id:     archetype_id,
          domain:           domain,
          descriptors:      descriptors,
          draws:            draws,
          distance:         distances,
          title:            title,
          categories:       categories,
          sets:             sets,
          status:           status
        };

  callAffinitomics(data, dataHandler, completionData, 'SyncArchetype');
}


function callAffinitomics(postData, dataHandler, completionData, callType)
{
  //create a required nonce value that must be unique for each api call. must be between 8-64 characters 
  nonce = 'xxxxxxxx-xxxx-1xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) 
  {
      var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
      return v.toString(16);
  });;

  postUrl = 'https://' +  g_serverUrl + '/api/' + callType + '?&ctype=' + g_ctype + '&cversion=' + g_cversion + '&nonce=' + nonce + '&user_key=' + g_apiKey;


  jQuery.ajax({
        type : "get",
        dataType : "json",
        url : postUrl,
        data : data,
        success: function(response) 
        {
          if (response['status'] == 'success')
          {
            console.log('Success on call: ' + callType); 
            dataHandler(response, completionData, callType);
          } 
          else 
          {
            console.log('Error, on call: ' + callType);
            dataHandler(response, completionData, callType);
          }
        }
     });
}



