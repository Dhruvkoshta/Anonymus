// No-op AuthProvider after removing NextAuth; kept for backwards compatibility
export default function AuthProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	return <>{children}</>;
}
