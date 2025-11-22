// Task domain types (ported to match original client expectations)

export interface Task {
	id: string;
	name: string;
	description?: string;
	jiraStatus?: string;
	sourceId?: string;
	butt?: string;
	creator?: string;
	owners: string[];
	subscribers: string[];
	history: any[];
	deletedAt?: Date | string;
	createdAt: Date | string;
	updatedAt: Date | string;
	// Optional relations
	projectId?: string;
	organisationId?: string;
}

export interface CreateTaskRequest {
	name: string;
	description?: string;
	jiraStatus?: string;
	sourceId?: string;
	owners?: string[];
	subscribers?: string[];
	creator?: string;
	history?: any[];
	deletedAt?: Date | string;
	createdAt?: Date | string;
	projectId?: string;
	organisationId?: string;
}

export interface UpdateTaskRequest {
	name?: string;
	description?: string;
	jiraStatus?: string;
	sourceId?: string;
	butt?: string;
	creator?: string;
	owners?: string[];
	subscribers?: string[];
	history?: any[];
	deletedAt?: Date | string;
	createdAt?: Date | string;
}


