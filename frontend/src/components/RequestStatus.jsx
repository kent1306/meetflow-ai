import "./RequestStatus.css";

function RequestStatus({ type = "idle", message = "" }) {
  const isVisible = type !== "idle" && Boolean(message);
  const visibleType = isVisible ? type : "idle";
  const isError = visibleType === "error";

  return (
    <div
      className={`request-status request-status--${visibleType}`}
      role={isError ? "alert" : "status"}
      aria-atomic="true"
    >
      {isVisible && (
        <>
          <span className="request-status__icon" aria-hidden="true">
            {type === "loading" && (
              <span className="request-status__spinner" />
            )}
            {type === "success" && "\u2713"}
            {isError && "!"}
          </span>
          <p>{message}</p>
        </>
      )}
    </div>
  );
}

export default RequestStatus;
