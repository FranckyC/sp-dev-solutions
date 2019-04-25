import IGroupService from "./IGroupService";
import { MSGraphClient } from "@microsoft/sp-http";

class GroupService implements IGroupService {

    private _graphClient: MSGraphClient;

    public constructor(graphClient: MSGraphClient) {
        this._graphClient = graphClient;
    }

    public async checkMembership(groupIds: string[]): Promise<string[]> {
        
        let memberGroupIds = [];

        if (groupIds.length > 0) {
            const response = await this._graphClient.api('/me/checkMemberGroups').post({
                groupIds: groupIds
            });

            memberGroupIds = response.value;
        }

        return memberGroupIds;
    }
}

export default GroupService;