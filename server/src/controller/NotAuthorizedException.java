package controller;

public class NotAuthorizedException extends RuntimeException {
    /**
	 * 
	 */
	private static final long serialVersionUID = 6886393342731226116L;

	public NotAuthorizedException() {
        super();
    }

    public NotAuthorizedException(String message) {
        super(message);
    }
}
