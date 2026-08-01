export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError('Unauthorized', 401));
    }
    // Ambil role user dari database berdasarkan req.user.userId
    // Jika role tidak ada di dalam array roles, lempar AppError 403
  };
};