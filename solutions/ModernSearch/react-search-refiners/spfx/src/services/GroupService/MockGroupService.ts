import IGroupService from "./IGroupService";

class MockGroupService implements IGroupService {

    public checkMembership(groupIds: string[]): Promise<string[]> {
        return Promise.resolve(groupIds);
    }
}

export default MockGroupService;