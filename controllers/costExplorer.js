const _ = require('lodash');

const DB = require('../db');

const getQuery = (clients, projects, cost_types) => {
    /*the idea is to get all costs with projects,clients and type data as data in the row.
    The grouping and cumulation will be done later
    */
    let query = `select 
                    cl.name as clientName,
                    cl.ID as clientId,
                    p.Title as projectName,
                    p.ID as projectId,
                    ct.Name as costName,
                    ct.ID costTypeID,
                    ct.Parent_Cost_type_ID as costTypeParentId,
                    c.amount as costAmount
                    from costs as c
                    inner join projects as p
                    on c.Project_ID=p.ID
                    inner join cost_types as ct
                    on c.Cost_type_ID=ct.ID
                    inner join clients as cl
                    on p.Client_ID=cl.ID
                    `;
                    
    if(clients.length !== 0 || projects.length !== 0 || cost_types.length !== 0) {
        query += ` where `;
        query += [
            clients.length > 0 ? `cl.Id in (${clients.join(',')})` : '',
            projects.length > 0 ? `p.ID in (${projects.join(',')})` : '',
            cost_types.length > 0 ? `(ct.ID in (${cost_types.join(',')}) or ct.Parent_Cost_type_ID in (${cost_types.join(',')}))` : ''
            // as shown in example query 4, all cost types and its direct children are to be considered only. 
        ]
        .filter(a => a!== '')
        .join(' and ');
    }
    query += ' ORDER BY cl.Id,p.Id,ct.ID'; // added to get the response in order as shown in example
    query += ';';
    return query;
}

// This function gets the breakdown of that particular costType(parentNode) recursively 
const getBreakDowm = (thisProjectCosts, parentNode) => {
    const retValue = [];
    thisProjectCosts.filter(a => a.costTypeParentId === parentNode).forEach(element => {
        const thisElement = {
            id: element.costTypeID,
            name: element.costName,
            amount: element.costAmount,
            breakdown: getBreakDowm(thisProjectCosts, element.costTypeID)
        }
        retValue.push(thisElement);
    });
    return retValue;
}

const getCostForQuery = async (clients, projects, cost_types) => {
    let dbQueryResp = []
    try {
        dbQueryResp = await DB.getQuery(getQuery(clients, projects, cost_types));
    } catch(err) {
        console.log('err', err); //use logger
        return [{
            err
        }];
    }
    const clientIDs = _.uniq(dbQueryResp.map(a=>a.clientId)).sort();
    const retValue = [];
    _.forEach(clientIDs, eachClient => {
        const thisClientInfo = dbQueryResp.filter(a=>a.clientId === eachClient);
        const thisClient = {
            id: eachClient,
            name: thisClientInfo[0].clientName,
            amount: _.reduce(thisClientInfo, (sum, obj) => {
                // null is checked since each node's amount is already a summation of its children in the DB
                return sum + (obj.costTypeParentId === null ? obj.costAmount : 0);
            }, 0),
            breakdown: []
        };
        const projects = _.uniq(thisClientInfo.map(a=>a.projectId)).sort();
        _.forEach(projects, eachProject => {
            const thisProjectCosts = thisClientInfo.filter(a=>a.projectId === eachProject);
            thisClient.breakdown.push({
                id: eachProject,
                name: thisProjectCosts[0].projectName,
                amount: _.reduce(thisProjectCosts, (sum, obj) => {
                    return sum + (obj.costTypeParentId === null ? obj.costAmount : 0);
                }, 0),
                breakdown: getBreakDowm(thisProjectCosts, null)
            });
        });
        retValue.push(thisClient);
    });
    return retValue;
    
}

module.exports = {
    getCostForQuery
};