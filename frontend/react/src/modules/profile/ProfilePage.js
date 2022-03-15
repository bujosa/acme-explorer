import { useStore } from '../../state/storeHooks';

export function ProfilePage () {
  const { user } = useStore(({ app }) => app);
	return <div><h1>Profile page ...</h1></div>;
}
