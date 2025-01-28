import { useMessage } from "@/contexts/message";
import { useLocalStorageBase64 } from "@/hooks/useLocalStorage64";
import { useEffect, useState } from "react";

type Token = {
  name: string;
  token: string;
};

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const TokenModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const [tokenName, setTokenName] = useState("");
  const [tokenValue, setTokenValue] = useState("");
  const { error, setError, clearMessages } = useMessage();
  const [tokens, setTokens] = useLocalStorageBase64<Token[]>("tokens", []);
  const [selectedToken, setSelectedToken] = useLocalStorageBase64<
    string | null
  >("selectedToken", null);

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 640);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 640);
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleAddToken = () => {
    if (!tokenName.trim() || !tokenValue.trim()) {
      setError("Both fields are required");
      return;
    }

    if (tokenValue.trim().length < 49) {
      setError("Token value should be min 50 carachters");
      return;
    }

    clearMessages();

    const newToken = { name: tokenName, token: tokenValue };
    const newTokens = [...tokens, newToken];
    setTokens(newTokens);

    // Automatically set the newly added token as the selected token
    setSelectedToken(tokenValue);

    // Reset input fields
    setTokenName("");
    setTokenValue("");
  };

  const handleDeleteToken = (indexInOrdered: number) => {
    // Find the token in the original tokens array
    const tokenToDelete = orderedTokens[indexInOrdered];
    const originalIndex = tokens.findIndex(
      (t) => t.token === tokenToDelete.token
    );

    // Remove the token from the original tokens array
    const newTokens = tokens.filter((_, i) => i !== originalIndex);
    setTokens(newTokens);

    // Clear the selected token if it's the one being deleted
    if (selectedToken === tokenToDelete.token) {
      setSelectedToken(null);
    }
  };

  const handleSelectToken = (token: string) => {
    setSelectedToken(token);
  };

  // const maskToken = (token: string) => {
  //   return `${token.slice(0, 2)}${"*".repeat(token.length - 4)}${token.slice(
  //     -2
  //   )}`;
  // };

  const maskToken = (token: string) => {
    if (isMobile && token.length >= 40) {
      // Shorter mask for mobile view
      return `${token.slice(0, 2)}${"*".repeat(token.length - 30)}${token.slice(
        -2
      )}`;
    }
    // Default mask for larger screens
    return `${token.slice(0, 2)}${"*".repeat(token.length - 4)}${token.slice(
      -2
    )}`;
  };

  const getOrderedTokens = () => {
    if (!selectedToken) return tokens;
    const selectedTokenIndex = tokens.findIndex(
      (t) => t.token === selectedToken
    );
    if (selectedTokenIndex === -1) return tokens;

    // Reorder to pin the selected token to the top
    const selected = tokens[selectedTokenIndex];
    const otherTokens = tokens.filter((_, i) => i !== selectedTokenIndex);
    return [selected, ...otherTokens];
  };

  if (!isOpen) return null;

  const orderedTokens = getOrderedTokens();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-[90%] max-w-lg p-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
        >
          ✕
        </button>

        {/* Modal Header */}
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Manage Tokens
        </h2>

        {/* Add Token Section */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-700 mb-2">Add Token</h3>
          <div className="space-y-3">
            {error && (
              <p className="text-red-500 text-sm font-medium">{error}</p>
            )}
            <input
              type="text"
              placeholder="Token Name"
              value={tokenName}
              onChange={(e) => setTokenName(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-100 text-gray-800"
            />
            <input
              type="text"
              placeholder="Token Value"
              value={tokenValue}
              onChange={(e) => setTokenValue(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-100 text-gray-800"
            />
            <button
              onClick={handleAddToken}
              className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-200"
            >
              Add Token
            </button>
          </div>
        </div>

        {/* List Tokens Section */}
        <div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">Tokens</h3>
          <div className="space-y-3 overflow-y-auto max-h-48 border rounded-lg p-3">
            {orderedTokens.length > 0 ? (
              orderedTokens.map((token, index) => (
                <div
                  key={index}
                  className={`flex justify-between items-center px-4 py-3 border rounded-lg transition ${
                    selectedToken === token.token
                      ? "bg-blue-100 border-blue-400"
                      : "bg-gray-50 hover:bg-gray-100"
                  }`}
                  onClick={() => handleSelectToken(token.token)}
                >
                  <div>
                    <p className="font-medium text-gray-800">{token.name}</p>
                    <p className="text-gray-600 text-sm">
                      {maskToken(token.token)}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteToken(index);
                    }}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Delete
                  </button>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center">No tokens added yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenModal;
