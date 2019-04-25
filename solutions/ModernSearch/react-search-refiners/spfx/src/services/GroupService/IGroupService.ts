interface IGroupService {
    /**
     * Checks if the current user is part of specified groups
     * @param groupIds the Office 365 groups ids to check
     */
    checkMembership(groupIds: string[]): Promise<string[]>;
} 

export default IGroupService;