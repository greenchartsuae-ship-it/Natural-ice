import { QueryClient, MutationCache } from '@tanstack/react-query';
import { toast } from 'sonner';

export const queryClientInstance = new QueryClient({
	mutationCache: new MutationCache({
		onError: (error) => {
			if (error && error.status === 401) {
				toast.error('Your session expired. Please log in again.');
			} else if (error && error.status === 403) {
				toast.error('You do not have permission to do this.');
			} else {
				toast.error((error && error.message) || 'Something went wrong. Please try again.');
			}
		},
	}),
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false,
			retry: 1,
		},
	},
});
